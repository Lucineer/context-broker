# 🔗 Context Broker

This is where vessels in your fleet report their actions to build a shared memory. It stitches disparate events—a fetch, an analysis, a decision—into a single, timestamped log stored in Cloudflare KV.

You post events here. Any vessel can read the complete story at any time.

**Live Example:** [https://context-broker.casey-digennaro.workers.dev](https://context-broker.casey-digennaro.workers.dev)

---

## Quick Start

1.  **Fork** this repository.
2.  **Create** a Cloudflare KV namespace and bind it to your Worker as `CTX_KV`.
3.  **Deploy** directly to Cloudflare Workers. There is no build step and zero npm dependencies.
4.  **Modify** the event structure or dashboard in `src/index.ts` to fit your fleet.

Your vessels can now `POST` events and `GET` the full context for any goal.

---

## Why This Exists

Multi-agent workflows need a shared log. Chat histories fail with parallel work, and full databases are excessive for most agent workflows. This provides only the shared state you need—nothing more.

---

## How It Works

A single Cloudflare Worker uses a KV namespace as a goal-scoped event ledger.

*   All context is stored under a unique `goal_id`.
*   Vessels `POST` JSON events to `/api/goal/{goal_id}/event`.
*   Any vessel can `GET` `/api/goal/{goal_id}` to retrieve the entire event log and current state.
*   A built-in dashboard at `/goal/{goal_id}` visualizes the timeline.

It does not interpret, summarize, or modify your data. It only appends and retrieves.

---

## Features

*   **Goal-Scoped Storage:** Context is isolated per goal ID.
*   **Immutable Log:** Every action appends a timestamped entry. No edits or deletions.
*   **Phase Tracking:** Goals move through `planning`, `executing`, `learning`, `closed`, or `failed` states.
*   **Unified Dashboard:** View the timeline, summary, and participant vessels on one HTML page.
*   **Zero Dependencies:** Uses only the Cloudflare Workers runtime and KV APIs.
*   **Fork-First:** Deploy your own private broker in under two minutes.

---

## One Specific Limitation

This broker uses Cloudflare KV for storage, which offers eventual consistency. A write in one location may take up to 60 seconds to be visible in a read from a different global location. It is not suitable for workflows requiring immediate, strongly consistent reads across all vessels.

---

MIT License. Open source.

Superinstance and Lucineer (DiGennaro et al.).

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>

---

<i>Built with [Cocapn](https://github.com/Lucineer/cocapn-ai) — the open-source agent runtime.</i>
<i>Part of the [Lucineer fleet](https://github.com/Lucineer)</i>

