# Bitget Deposit Router (Base MVP)

Convert any ERC-20 token sitting in your wallet on **Base** into ETH or USDC, and
send it straight to your Bitget deposit address — in one flow, with no manual
swapping and no risk of sending an unsupported token directly to an exchange.

This is **single-chain**: everything happens on Base. There is no bridging, no
chain switcher, and no support for any other network.

## How it works

1. Connect a wallet (MetaMask, Rabby, Coinbase Wallet, or WalletConnect).
2. The app checks you're on Base and prompts a network switch if not.
3. Pick an ERC-20 token from your wallet (e.g. PEPE) and an amount.
4. Enter your Bitget deposit address (Base network) and choose ETH or USDC as
   the asset you want Bitget to receive.
5. Review the 1inch quote, slippage, and gas estimate.
6. Confirm. The app:
   - approves the 1inch router for the input token (skipped for ETH or for
     tokens that don't need it),
   - swaps the input token into ETH/USDC on Base via 1inch,
   - transfers the resulting ETH/USDC to your Bitget deposit address.
7. See a success screen with the transaction hash.

If you pick a token that Bitget already supports natively (ETH or USDC), the
swap step is skipped entirely and the token is sent directly — the app never
adds an unnecessary hop.

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in ONEINCH_API_KEY and NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
npm run dev
```

Open http://localhost:3000.

### Required environment variables

| Variable | Where to get it | Notes |
|---|---|---|
| `ONEINCH_API_KEY` | https://portal.1inch.dev | Server-side only. Used by the `/api/1inch/*` proxy routes — never sent to the browser. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | https://cloud.reown.com | Needed for the WalletConnect connector. App still works with MetaMask/Rabby/Coinbase Wallet without it. |
| `NEXT_PUBLIC_BASE_RPC_URL` | Any Base RPC provider | Optional. Falls back to the public `mainnet.base.org` RPC. |

## Why a server-side proxy for 1inch

The 1inch Swap API requires an API key in the `Authorization` header. Calling
it directly from the browser would expose that key and run into CORS. The
routes under `app/api/1inch/` forward requests to `api.1inch.dev` with the key
attached server-side, and the browser only ever talks to our own `/api/1inch/*`
endpoints.

## Safe Deposit Mode

The app deliberately won't let a transaction go out unless the destination
address passes basic validation, and it always shows whether the selected
token needs to be converted before it's safe to send to Bitget. This is the
core safety feature: it exists specifically to stop unsupported-token deposits
from going missing.

## Project structure

See the file tree in the project description / chat — `app/` holds routed
pages and the 1inch API proxy, `components/` holds UI building blocks,
`hooks/` holds the data-fetching and execution logic, and `lib/` holds
framework-agnostic helpers (constants, wagmi config, validators, formatting).

## Known MVP limitations

- USD pricing on the token list is left as `undefined` (`formatUsd` renders
  "—") — wire up a price feed (1inch's `/price` endpoint or a provider like
  CoinGecko) if you need it for the demo.
- The wallet token scan multicalls `balanceOf` across the first 300 tokens in
  1inch's Base token list; extremely obscure tokens outside that list won't
  show up.
- No transaction history / persistence — this is intentionally a single-pass
  flow, not a dashboard.
