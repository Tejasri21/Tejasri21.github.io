/* Real CodeCompass sessions (MockLLM, offline) transcribed from the project README.
   Do not hand-edit. Threshold: critic score >= 0.55 is sufficient. */
const CODECOMPASS_DEMOS = {
  "retry": {
    "label": "Direct question",
    "question": "Where is the retry logic with exponential backoff implemented?",
    "planner": "2 sub-queries",
    "rounds": [
      { "n": 1, "chunks": 4, "score": 0.60, "verdict": "sufficient", "note": null }
    ],
    "answer": "Found in `RetryingClient` (http_client.py:23). HTTP client that retries transient failures with exponential backoff.",
    "sources": ["http_client.py:23"],
    "abstained": false
  },
  "flaky": {
    "label": "Paraphrased question — corrective loop",
    "question": "How are flaky downstream calls handled?",
    "planner": "2 sub-queries",
    "rounds": [
      { "n": 1, "chunks": 4, "score": 0.50, "verdict": "weak", "note": "evidence weak — rewriting query and re-retrieving (round 2)" },
      { "n": 2, "chunks": null, "score": 0.75, "verdict": "sufficient", "note": null }
    ],
    "answer": "Found in `RetryingClient` (http_client.py:23). HTTP client that retries transient failures with exponential backoff.",
    "sources": ["http_client.py:23"],
    "abstained": false
  },
  "graphql": {
    "label": "Unanswerable question",
    "question": "Where is the GraphQL schema defined?",
    "planner": "2 sub-queries",
    "rounds": [
      { "n": 1, "chunks": 4, "score": 0.00, "verdict": "weak", "note": "evidence weak — rewriting query and re-retrieving (round 2)" },
      { "n": 2, "chunks": null, "score": 0.00, "verdict": "weak", "note": "still weak — evidence insufficient" }
    ],
    "answer": "I couldn't find this in the codebase.",
    "sources": [],
    "abstained": true
  }
};
