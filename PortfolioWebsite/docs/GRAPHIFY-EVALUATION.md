# Graphify evaluation — September 21, 2026

**Decision: do not integrate Graphify.** The isolated trial failed the agreed token-saving gate. Retain ordinary targeted searches and source reads. No Graphify agent instructions, MCP configuration, watcher, runtime dependency, or reusable project graph is enabled.

## Measured comparison

Same model (`gpt-6-astra`, medium reasoning), identical task questions and answer criteria, fresh Codex CLI sessions for each method. Metric: reported cumulative `input_tokens + output_tokens`, including cached input. Instructions, available tool metadata, graph results, follow-up source reads, and responses are included in these session totals. Reasoning detail is not added again to output tokens.

| Task | Targeted-search baseline | Graph-assisted | Graph cost change |
| --- | ---: | ---: | ---: |
| Architecture | 183,531 | 204,534 | +11.4% |
| Draft persistence | 125,948 | 145,481 | +15.5% |
| Authentication | 142,390 | 134,503 | -5.5% |
| Uploads | 109,229 | 120,530 | +10.3% |
| Documentation / implementation | 234,797 | 233,156 | -0.7% |
| **Total** | **795,895** | **838,204** | **+5.3%** |

The required result was at least **30% less** aggregate usage, with no task more than **10% higher**. Architecture, draft persistence, and uploads each breached the per-task limit. Authentication and documentation improved slightly, but did not compensate for the other tasks.

As a supplementary measure, excluding cached input gives **174,711 baseline versus 162,108 graph tokens**, a **7.2% reduction**. This is not the agreed total-token metric and also falls short of 30%. Caching and model variation mean these figures are not a billing forecast.

## Indexing and maintenance

Initial documentation indexing consumed **226,449 measured agent tokens**. Code parsing was local and used no model. This is a lower bound: evaluator setup/orchestration and an earlier interrupted trial whose `/tmp` files were lost are excluded.

A separate same-model maintenance fixture updated one code file and one documentation file, preserved an unrelated file, and reported six extracted nodes. Its **61,943 tokens** include the agent correcting a schema warning and rerunning the merge. The code was parsed locally; the model interpreted only the changed documentation.

Five research tasks plus one such maintenance update cost **900,147 graph-side tokens**, **13.1% above** the baseline. This is an explicit workload scenario, not an assumed universal update rate. Read-only tasks incur no update. Either with zero updates or one per five tasks, average total-token savings are negative, so initial indexing has **no finite break-even** at the observed rates; it is not recovered within 20 tasks. At the supplementary uncached-only rate and with no updates, indexing would take approximately 44 comparable tasks to recover, before unmetered setup costs.

## Trial and validation

- Evaluated `graphifyy[mcp]==0.9.64` in an isolated Python virtual environment against source copies of commit `6b961545cf335ec575218e858092aa20902311bb`. Owner content, public assets, environment files, and the package lock were excluded from both corpora. No project instructions or assistant configuration were changed.
- The graph combined local parsing with 62 source-linked semantic concepts covering all 27 copied Markdown documents: **836 nodes and 1,952 edges**. Unsupported files, including CSS and Firebase rules, were not parsed into code relationships; agents could read their sources. This was not complete semantic coverage of every file type.
- The baseline used file discovery, focused `rg` searches, and targeted reads. It did not read the whole repository. Graph sessions used the same terminal tools plus the query command and its instructions; they did not read the entire graph/report. This tested CLI retrieval, not additional MCP-tool metadata overhead.
- Five query-budget samples returned **1,267–1,414 tokens** using `o200k_base` as a proxy tokenizer with a requested 1,500-token budget. This verifies those samples, not a universal hard cap or Astra's exact tokenizer.
- Disposable fixture tests passed changed-file replacement, additions, deletions, renames, preservation of unrelated code/document nodes and relationships, and absence of dangling edges. These test Graphify's extraction/merge primitives, not a production maintenance wrapper or comprehensive affected-caller reconciliation.
- A source-grounded self-review applied the same five-item rubric to each answer pair. Both methods covered all required rubric items; no material correctness or grounding loss was found. This was not a blind independent review, runtime test, or claim about production configuration.

## Limitations and retained evidence

One graph upload attempt hit the account usage limit and ended without usage totals. It is retained as an interrupted attempt; uploads and documentation subsequently completed with the same prompts and model. Its unknown cost is excluded, which favors Graphify. There is one completed run per task per method, with no statistical confidence claim or selection of favorable reruns.

All original tracked project files were verified unchanged. The temporary installation, graph, source copies, fixture tooling, and trial credential link were removed after preserving evidence. Application behavior and layout did not change, so browser checks, screenshots, and portfolio critic scores were not rerun.

[Machine-readable results](evaluations/graphify-results.json) contain prompts, answers, usage, command traces, criteria, and fixture results. The [compressed audit evidence](evaluations/graphify-evidence.json.gz) contains raw CLI events, interrupted-attempt evidence, indexing outputs, environment details, pinned dependencies, and trial scripts as inert text. It contains no virtual environment, corpus, graph, or authentication file. Neither artifact is attached automatically to agent sessions.
