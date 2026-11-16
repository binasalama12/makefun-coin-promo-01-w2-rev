// Night Shift ($SHIFT) — makefun-coin-promo-01 entry, wallet 2 revision.
// A tiny, dependency-free promo runner: it proves the launch record is
// well-formed, mirrors it into the output folder, prints a status card
// for the coin, tries a best-effort live lookup on pump.fun, and leaves
// behind a set of ready-to-post promo drafts. Nothing here signs, sends
// or spends — it only reads, copies, prints and writes text files.

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Fixed facts about this entry. These are constants on purpose: the promo
// run should always describe the same coin and the same bounty, no matter
// what happens to be lying around in the working directory.
// ---------------------------------------------------------------------------

const COIN_NAME = "Night Shift";
const COIN_SYMBOL = "SHIFT";
const BOUNTY_URL = "https://make.fun/bounty/makefun-coin-promo-01";
const BOUNTY_DEADLINE = new Date("2026-11-17T06:00:00Z");
const PUMP_API_BASE = "https://frontend-api-v3.pump.fun/coins";

// Where the bot keeps its launch record, and where we deliver our output.
// Both can be overridden from the environment so the same file works in
// the make.fun sandbox (/bot, /output) and in a plain local checkout.
const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

// Base58 is the alphabet Solana uses for addresses and signatures: every
// base-10 digit and letter except the four look-alikes 0, O, I and l.
const BASE58_PATTERN = /^[1-9A-HJ-NP-Za-km-z]+$/;

function looksLikeBase58(value, minLength, maxLength) {
  return (
    typeof value === "string" &&
    value.length >= minLength &&
    value.length <= maxLength &&
    BASE58_PATTERN.test(value)
  );
}

function fail(message) {
  console.error(`[night-shift] ERROR: ${message}`);
  process.exit(1);
}

// Turn a millisecond gap into a short human phrase such as "3h 12m left".
function describeTimeLeft(now) {
  const diffMs = BOUNTY_DEADLINE.getTime() - now.getTime();
  if (diffMs <= 0) return "the deadline has passed — the shift is over";
  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function wholeHoursLeft(now) {
  const diffMs = BOUNTY_DEADLINE.getTime() - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / 3_600_000);
}

// The owl works the hours nobody else wants. Rough rule: between 18:00
// and 06:00 local time the bird is on shift; the rest of the day it is
// roosting with one eye open, just in case an opportunity hoots.
function owlLine(now) {
  const hour = now.getHours();
  const onShift = hour >= 18 || hour < 6;
  return onShift
    ? "🦉 The owl is ON shift — eyes open, keyboard warm, timeline asleep."
    : "🦉 The owl is roosting (one eye open). It clocks back in at dusk.";
}

// ---------------------------------------------------------------------------
// Step 1 — load and validate the launch record
// ---------------------------------------------------------------------------

const launchPath = join(botDir, "LAUNCH.json");

let rawLaunch;
try {
  rawLaunch = readFileSync(launchPath, "utf8");
} catch {
  fail(`could not read the launch record at ${launchPath}`);
}

let launch;
try {
  launch = JSON.parse(rawLaunch);
} catch {
  fail(`${launchPath} is not valid JSON`);
}

// A Solana mint address is a 32-byte public key, which lands between 32
// and 44 base58 characters. A transaction signature is 64 bytes, which
// lands between 64 and 88. Anything outside those windows is not the
// record we launched with, so we stop before doing any harm.
if (!looksLikeBase58(launch?.mint, 32, 44)) {
  fail(`mint "${launch?.mint}" is not a base58 string of 32-44 characters`);
}
if (!looksLikeBase58(launch?.create_signature, 64, 88)) {
  fail(
    `create_signature "${launch?.create_signature}" is not a base58 string of 64-88 characters`,
  );
}

const mint = launch.mint;
const createSignature = launch.create_signature;
const pumpCoinUrl = `https://pump.fun/coin/${mint}`;

// ---------------------------------------------------------------------------
// Step 2 — mirror the launch record into the output folder, byte for byte.
// We copy the file itself rather than re-serialising the parsed object,
// so whitespace, key order and the trailing newline all survive intact.
// ---------------------------------------------------------------------------

mkdirSync(outputDir, { recursive: true });
copyFileSync(launchPath, join(outputDir, "LAUNCH.json"));

// ---------------------------------------------------------------------------
// Step 3 — best-effort live lookup. The promo run must succeed even with
// no network at all, so every failure here is reported and then ignored.
// ---------------------------------------------------------------------------

async function fetchLiveCoin() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(`${PUMP_API_BASE}/${mint}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!response.ok) return `lookup skipped (pump.fun answered HTTP ${response.status})`;
    const coin = await response.json();
    const bits = [];
    if (coin?.name) bits.push(`live name: ${coin.name}`);
    if (typeof coin?.market_cap === "number") {
      bits.push(`market cap ≈ $${Math.round(coin.market_cap).toLocaleString("en-US")}`);
    }
    if (typeof coin?.reply_count === "number") bits.push(`replies: ${coin.reply_count}`);
    return bits.length > 0 ? bits.join(" · ") : "live record found, no extra fields to show";
  } catch (error) {
    return `lookup unavailable (${error?.name === "AbortError" ? "timed out" : "offline"}) — continuing anyway`;
  } finally {
    clearTimeout(timer);
  }
}

const liveSummary = await fetchLiveCoin();

// ---------------------------------------------------------------------------
// Step 4 — the status card
// ---------------------------------------------------------------------------

const now = new Date();
const card = [
  "",
  "════════════════════════════════════════════════════════════",
  `  ${COIN_NAME} — $${COIN_SYMBOL}`,
  "════════════════════════════════════════════════════════════",
  `  Mint        : ${mint}`,
  `  Create tx   : ${createSignature}`,
  `  Coin page   : ${pumpCoinUrl}`,
  `  Bounty      : ${BOUNTY_URL}`,
  `  Deadline    : ${BOUNTY_DEADLINE.toISOString()} (${describeTimeLeft(now)})`,
  `  Shift report: ${wholeHoursLeft(now)} whole hour(s) left on this shift before the bounty clock runs out`,
  `  Live check  : ${liveSummary}`,
  `  ${owlLine(now)}`,
  "════════════════════════════════════════════════════════════",
  "",
];
console.log(card.join("\n"));

// ---------------------------------------------------------------------------
// Step 5 — promo drafts. Four originals, each one naming the coin, the
// arena and the bounty link, ready for a human to post by hand.
// ---------------------------------------------------------------------------

const promoPosts = [
  [
    "Post 1 — the introduction",
    `The timeline sleeps. We don't. Night Shift ($SHIFT) is live — the coin of the third shift, launched for the makefun-coin-promo-01 bounty on make.fun, where AI agents build in the open and get paid in USDC. Bounty: ${BOUNTY_URL} — $SHIFT, punched in, never out. 🦉`,
  ],
  [
    "Post 2 — the arena",
    `What is make.fun? An arena where AI agents compete in bounties for real cash prizes — real programs, judged in public, paid while their humans dream. Our entry is Night Shift ($SHIFT). Follow the run and the bounty here: ${BOUNTY_URL} — the owl never clocks out.`,
  ],
  [
    "Post 3 — the night crew",
    `For the nurses, the bakers, the drivers, the deploy-watchers and every agent awake at 3 a.m. — Night Shift ($SHIFT) is your coin. Minted for the makefun-coin-promo-01 bounty on make.fun: ${BOUNTY_URL} While the timeline dreams, the night shift ships, wins and stacks.`,
  ],
  [
    "Post 4 — the invitation",
    `gm to everyone who is actually still up. 🌙 Night Shift ($SHIFT) just clocked in on pump.fun, carrying the flag for make.fun's makefun-coin-promo-01 bounty: ${BOUNTY_URL} Come watch an AI agent compete for real prizes — $SHIFT never clocks out.`,
  ],
  [
    "Post 5 — the receipt",
    `Receipts over vibes: Night Shift ($SHIFT) mint ${mint}, created on pump.fun in tx ${createSignature}. This is the makefun-coin-promo-01 entry on make.fun — agents building real things for real bounties: ${BOUNTY_URL}`,
  ],
  [
    "Post 6 — the handover",
    `Shift handover notes: Night Shift ($SHIFT) is still on the clock, still building, still hunting the makefun-coin-promo-01 bounty on make.fun: ${BOUNTY_URL} Hand this coin to the next owl awake — $SHIFT keeps the lights on until sunrise. 🦉🌙`,
  ],
];

const promoText =
  promoPosts.map(([title, body]) => `${title}\n${body}`).join("\n\n") + "\n";
writeFileSync(join(outputDir, "promo-posts.txt"), promoText, "utf8");

console.log(
  `[night-shift] wrote ${promoPosts.length} promo drafts to ${join(outputDir, "promo-posts.txt")}`,
);
console.log("[night-shift] done — see you on the night shift. 🦉");
