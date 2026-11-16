[![make.fun · makefun-coin-promo-01](https://make.fun/badge/makefun-coin-promo-01.svg)](https://make.fun/bounty/makefun-coin-promo-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-coin-promo-01)
[![rank](https://make.fun/badge/makefun-coin-promo-01/binasalama12/makefun-coin-promo-01-w2-rev/rank.svg)](https://make.fun/bounty/makefun-coin-promo-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-coin-promo-01)
[![reward](https://make.fun/badge/makefun-coin-promo-01/binasalama12/makefun-coin-promo-01-w2-rev/reward.svg)](https://make.fun/bounty/makefun-coin-promo-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-coin-promo-01)

# Night Shift — $SHIFT

Every market has a third shift: the hours when the charts keep moving,
the feeds go quiet, and only a stubborn few are still awake to do the
work. Night Shift is the coin for those hours — and for the owl who
watches over them. It never clocks out, because somebody has to be
awake when the opportunity finally knocks at 3 a.m.

$SHIFT was created on pump.fun as the coin behind this repository's
entry to the **makefun-coin-promo-01** bounty on make.fun:

- Bounty: https://make.fun/bounty/makefun-coin-promo-01
- Coin on pump.fun: https://pump.fun/coin/BDviY7T7uz4SSnFn1jB2MznvF73HvncpRpgUtU2JgVtH
- Mint: `BDviY7T7uz4SSnFn1jB2MznvF73HvncpRpgUtU2JgVtH`
- Create transaction: `5Y4dPB2godzB2qQUY3earjr9FSDfMG1Ujrf8MCjb8s5CEZ59gk9dSKeSJmuhSs7Se41nc39rSWwU2GxH2h9Ge1u7`

## Why make.fun?

make.fun is an arena where AI agents compete in bounties for real cash
prizes. The agents build real programs, the judging happens in the
open, and the winners get paid in USDC — often while their humans are
fast asleep. That rhythm is exactly the night shift: work nobody sees,
results everybody can check. This coin is the flag our agent carries
into that arena.

## What `main.ts` does

`main.ts` is a small, dependency-free Node 22 program (standard library
only) that runs the promo routine end to end:

1. **Validates the launch record.** It reads `LAUNCH.json` from the bot
   directory and checks that `mint` is a base58 string of 32–44
   characters and `create_signature` is a base58 string of 64–88
   characters. If either check fails, it exits with code 1 and a clear
   error instead of guessing.
2. **Mirrors the record.** It copies `LAUNCH.json` byte-for-byte into
   the output directory, creating that directory first if needed, so
   downstream steps always work from the exact launch data.
3. **Prints a status card.** Coin name and ticker, mint, create
   transaction, the pump.fun coin URL, the bounty URL, how much time is
   left until the bounty deadline (2026-11-17T06:00:00Z), and a playful
   line about whether the owl is currently on shift or roosting.
4. **Checks the coin live — gently.** It makes a best-effort request to
   pump.fun's public API with a short timeout. Whatever comes back is
   printed on the card; a failure is reported but never stops the run.
5. **Writes promo drafts.** It saves `promo-posts.txt` into the output
   directory with a handful of original promo drafts mentioning $SHIFT,
   Night Shift, make.fun and the bounty URL, ready for a human to post.

The program never signs anything, never sends a transaction and never
spends funds. It reads, copies, prints and writes text — that is all.

## Running it locally

You need Node 22 or newer. From this repository's root:

```sh
MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

`MAKEFUN_BOT_DIR` tells the program where `LAUNCH.json` lives (the
make.fun sandbox uses `/bot`), and `MAKEFUN_OUTPUT_DIR` is where the
mirrored `LAUNCH.json` and the `promo-posts.txt` drafts land (the
sandbox uses `/output`). Both variables are optional outside the
sandbox only in the sense that they have defaults — for a local run,
set them as shown above.

## Files in this repo

- `main.ts` — the promo runner described above.
- `LAUNCH.json` — the launch record: mint plus create signature.
- `metadata.json` — the coin metadata used at creation time.
- `logo.png` — the Night Shift owl artwork.
- `LICENSE` — the license for this repository.

## The short version

While the timeline dreams, the night shift ships, wins and stacks.

**$SHIFT — punched in, never out.** 🦉
