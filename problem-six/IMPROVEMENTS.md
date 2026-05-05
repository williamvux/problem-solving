# Suggestions for Improvement

V1-out-of-scope items, in rough order of impact. The reference v1 design lives in [README.md](README.md).

---

## 1. Server-to-server award path

**Problem.** V1 trusts the client to relay an action token from `/actions/start` to `/scores/complete`. That's the right design when the action runs on the client. When it runs on our backend (e.g. a server-graded quiz, a payment webhook), putting the client in the loop is gratuitous attack surface.

**Proposal.** Add an internal endpoint that other services call directly with mTLS or a service JWT. Reuse the same `score_events` write path so audit and idempotency still apply.

```ts
router.post('/internal/scores/award', verifyServiceJWT, async (req, res) => {
  const { userId, delta, sourceEventId } = req.body;
  // sourceEventId fills the same role as action_token_id (dedup + audit)
  const { newScore } = await scoreService.award({
    userId, delta, idempotencyKey: sourceEventId,
  });
  res.json({ newScore });
});
```

**Trade-off.** Two paths to maintain. Skip if every action will always be client-driven.

---

## 2. Redis Streams instead of Pub/Sub

**Problem.** Pub/Sub is fire-and-forget. If an API instance is restarting or its Redis connection blips, every event in that window is lost — connected WS clients silently miss updates until the next page refresh.

**Proposal.** Use a Redis Stream with a consumer group. Streams persist events for a configurable window and let clients resume from any event ID.

```ts
// publisher
await redis.xadd('leaderboard:events', 'MAXLEN', '~', '10000', '*',
  'userId', userId, 'newScore', String(newScore));

// consumer (one loop per API instance)
const events = await redis.xreadgroup(
  'GROUP', 'api', instanceId,
  'BLOCK', 5000, 'COUNT', 100,
  'STREAMS', 'leaderboard:events', '>',
);
```

**Trade-off.** More to operate (offsets, acks, retention). Adopt when dropped events outweigh the operational cost.

---

## 3. Behavioural rate limits

**Problem.** A request rate limit caps requests, not score. With a high `delta`, a few legitimate-looking completions per minute still produce impossible totals. The defender needs a limit on what actually matters.

**Proposal.** In addition to the request limiter, keep a sliding-window sum of `delta` per user and reject when it exceeds an organic-user p99 ceiling.

```ts
async function checkScoreVelocity(userId: string, delta: number) {
  const key = `velocity:${userId}`;
  const now = Date.now();
  await redis.zremrangebyscore(key, 0, now - 60_000);
  const recent = sumDeltas(await redis.zrange(key, 0, -1));
  if (recent + delta > CEILING) throw new RateLimitError();
  await redis.zadd(key, now, `${now}:${delta}`);
}
```

**Trade-off.** Threshold must be tuned from real data. Pair with §4 so ops can review borderline cases instead of auto-blocking.

---

## 4. Fraud-freeze flag

**Problem.** When the anomaly detector flags a user, today's options are "do nothing" or "delete data" — both bad. Ops needs a reversible way to hide a suspicious user from the live scoreboard during investigation.

**Proposal.** Add `frozen BOOLEAN` to `user_scores`. Score updates still record events; the broadcaster removes frozen users from the ZSET so they don't appear in Top-10.

```sql
ALTER TABLE user_scores ADD COLUMN frozen BOOLEAN NOT NULL DEFAULT false;
```

```ts
// freeze: hide from leaderboard, keep history
await db.query('UPDATE user_scores SET frozen = true WHERE user_id = $1', [id]);
await redis.zrem('leaderboard', id);

// score-update path: skip ZADD if frozen, but still INSERT into score_events
```

**Trade-off.** Two states to keep in sync — the reconciler already handles drift.

---

## 5. Coalesce broadcasts

**Problem.** During hot moments, score updates can fire dozens of times per second. Each currently triggers a WS push to every client — wasted bandwidth and a jittery scoreboard.

**Proposal.** Batch incoming events on a 100 ms tick. At end of tick, push the current Top-10 once. Worst-case staleness is below human perception.

```ts
let pending = false;
function scheduleBroadcast() {
  if (pending) return;
  pending = true;
  setTimeout(async () => {
    pending = false;
    const top10 = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
    for (const ws of activeSockets) ws.send(JSON.stringify({ top: top10 }));
  }, 100);
}
```

**Trade-off.** 100 ms of freshness for a large drop in WS traffic. The user who triggered the update already gets a synchronous `200` from the HTTP response, so they see their own score immediately.

---

## 6. Reconnect resume

**Problem.** WS drops happen. Today the client refetches `/scoreboard/top` on reconnect — wasteful for short gaps, inadequate for longer ones.

**Proposal.** Pairs with §2. Each event has a stable Stream ID. On reconnect the client passes its `lastEventId`; the server replays missed events.

```ts
// client
const ws = new WebSocket(`/scoreboard/live?lastEventId=${lastEventId ?? ''}`);

// server, on upgrade
const missed = await redis.xrange('leaderboard:events', lastEventId || '$', '+');
for (const [id, fields] of missed) ws.send(JSON.stringify({ id, ...parse(fields) }));
```

**Trade-off.** Needs a stream backlog covering realistic disconnects. Always keep `/scoreboard/top` refetch as a fallback for clients offline longer than the retention window.

---

## Triage order

If only some of these get done next quarter:

1. **§3 + §4** — directly address the security requirement; cheap to ship together.
2. **§1** — only if a real action moves server-side.
3. **§5** — once a single user's update fires more than ~10×/sec in production.
4. **§2 + §6** — together as one project. Half the feature is not worth doing.
