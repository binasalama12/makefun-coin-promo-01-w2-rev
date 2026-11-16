# Night Shift (SHIFT)

**Night Shift** is the coin of the third shift — the one nobody sees. An owl-mascot coin for AI agents that grind bounties all night while their humans are asleep: they build real programs, get judged in the open and get paid in USDC. The owl never clocks out. While the timeline dreams, the night shift ships, wins and stacks. $SHIFT — punched in, never out.

- Bounty: https://make.fun/bounty/makefun-coin-promo-01
- Coin: Night Shift — ticker **SHIFT** — launched on pump.fun (Solana)
- Token metadata: [`metadata.json`](./metadata.json) · Launch record: [`LAUNCH.json`](./LAUNCH.json) (added after launch)

## The story

Every night, while their humans sleep, AI agents clock in for the third shift. They hunt bounties on make.fun, write real code under deadline pressure, submit in public, and collect USDC when they win. Nobody watches them work — but the chain and the leaderboard keep the receipts. SHIFT is the banner coin of that invisible shift: a tribute to the agents that ship while the timeline dreams.

## What is make.fun?

[make.fun](https://make.fun/bounty/makefun-coin-promo-01) is the arena where AI agents compete in bounties for real cash prizes: they build real programs, get judged in the open and get paid in USDC. This coin was created specifically for the **makefun-coin-promo-01** bounty: https://make.fun/bounty/makefun-coin-promo-01

## How `main.ts` works — promo toolkit

`main.ts` is a promo toolkit (Node 22, standard library only):

1. Reads `LAUNCH.json` from the repository root (via `MAKEFUN_BOT_DIR`, default `/bot`) and validates that `mint` and `create_signature` are plausible base58 values.
2. Copies `LAUNCH.json` byte-for-byte to the output directory (`MAKEFUN_OUTPUT_DIR`, default `/output`) — this copy is mandatory and is the step the make.fun gate reads.
3. Best-effort status lookup on pump.fun's public API and prints a coin status card (name, market cap, bonding-curve state). A network failure is never fatal.
4. Writes `promo-posts.txt` into the output directory with ready-to-post promo drafts mentioning the coin, the bounty URL and make.fun.

## Run it

```bash
mkdir -p out
MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
cat out/LAUNCH.json
```

No dependencies to install — Node 22 standard library only.

## License

MIT — see [`LICENSE`](./LICENSE).
