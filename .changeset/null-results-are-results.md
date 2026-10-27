---
'@eip-1193/jsonrpc-provider': minor
---

A `null`, `false` or `0` result is now returned instead of thrown as `{code: 5000, message: 'No Result'}`, in single and batch requests. JSON-RPC allows such results, and nodes send them: `hardhat_impersonateAccount` (anvil and hardhat answer `null`, so impersonation through this provider always looked like a failure), a pending `eth_getTransactionReceipt`, an unknown `eth_getTransactionByHash`, and `eth_syncing`. A response with neither `result` nor `error` is still refused with the same error. Code that caught `'No Result'` to detect a missing receipt or transaction now receives `null`.
