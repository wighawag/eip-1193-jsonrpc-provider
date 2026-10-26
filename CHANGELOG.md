# @eip-1193/jsonrpc-provider

## 0.5.0

### Minor Changes

- 1c777cc: Renamed to `@eip-1193/jsonrpc-provider`. The unscoped `eip-1193-jsonrpc-provider` is no longer updated: replace the dependency and the import specifier (`from 'eip-1193-jsonrpc-provider'` becomes `from '@eip-1193/jsonrpc-provider'`). The exported API is unchanged.

  Fixed: `eip-1193` is now a regular `dependency` instead of a `devDependency`. The public types reference it, and declaring it only as a devDependency broke consumers in two ways depending on the release line. 0.3.x shipped a `.d.ts` that imports `'eip-1193'` without declaring it, which fails with `TS2307: Cannot find module 'eip-1193'` under pnpm's strict `node_modules` layout. 0.4.x inlined a frozen copy of the `eip-1193@0.6.2` types into its `.d.ts`; that copy contains a typo from 0.6.2 (`resu; t` in `eth_getUncleCountByBlockNumber`) which reports `TS7008` for consumers that do not set `skipLibCheck`, and it never picked up later `eip-1193` fixes. The `.d.ts` now imports the types from the installed `eip-1193` package.

  Requires `eip-1193@^0.7.0`, a breaking release of the types (see its release notes). `JSONRPCHTTPProvider` now declares `implements EIP1193HttpNodeProvider` instead of `EIP1193ProviderWithoutEvents`: it talks to a JSON-RPC node over plain HTTP, so it serves the node method set minus subscriptions. Its `request()` signature is unchanged and still accepts any method, so it remains assignable to every `eip-1193` provider type.
