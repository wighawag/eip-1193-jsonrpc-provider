// Runs against the built package (`pnpm build` first; `pnpm test` does both), with node's own test
// runner and a local HTTP server, so it needs no dependency.
import {test, after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {ethereum_request} from '../dist/index.mjs';

// The server answers each method with the JSON-RPC body given here.
const answers = {
	null_result: {jsonrpc: '2.0', id: 1, result: null},
	false_result: {jsonrpc: '2.0', id: 1, result: false},
	zero_result: {jsonrpc: '2.0', id: 1, result: 0},
	hex_result: {jsonrpc: '2.0', id: 1, result: '0x1'},
	error: {jsonrpc: '2.0', id: 1, error: {code: -32601, message: 'Method not found'}},
	neither: {jsonrpc: '2.0', id: 1},
};

const server = createServer((req, res) => {
	let body = '';
	req.on('data', (chunk) => (body += chunk));
	req.on('end', () => {
		const parsed = JSON.parse(body);
		const answer = Array.isArray(parsed)
			? parsed.map((r) => ({...answers[r.method], id: r.id}))
			: answers[parsed.method];
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(answer));
	});
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const endpoint = `http://127.0.0.1:${server.address().port}`;
after(() => server.close());

test('a null result is returned, not thrown (hardhat_impersonateAccount, a pending receipt)', async () => {
	assert.equal(await ethereum_request(endpoint, {method: 'null_result'}), null);
});

test('false and 0 results are returned, not thrown (eth_syncing)', async () => {
	assert.equal(await ethereum_request(endpoint, {method: 'false_result'}), false);
	assert.equal(await ethereum_request(endpoint, {method: 'zero_result'}), 0);
});

test('a regular result is returned', async () => {
	assert.equal(await ethereum_request(endpoint, {method: 'hex_result'}), '0x1');
});

test('an error is thrown as the node sent it', async () => {
	await assert.rejects(ethereum_request(endpoint, {method: 'error'}), {code: -32601, message: 'Method not found'});
});

test('a response with neither result nor error is still refused', async () => {
	await assert.rejects(ethereum_request(endpoint, {method: 'neither'}), {code: 5000, message: 'No Result'});
});

test('a batch returns null and false results, and fails only on an error or a missing result', async () => {
	assert.deepEqual(
		await ethereum_request(endpoint, {
			method: 'eth_batch',
			params: [{method: 'null_result'}, {method: 'false_result'}, {method: 'hex_result'}],
		}),
		[null, false, '0x1'],
	);
	await assert.rejects(
		ethereum_request(endpoint, {method: 'eth_batch', params: [{method: 'hex_result'}, {method: 'neither'}]}),
	);
	await assert.rejects(
		ethereum_request(endpoint, {method: 'eth_batch', params: [{method: 'hex_result'}, {method: 'error'}]}),
	);
});
