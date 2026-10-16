/* Real TriagePilot runs (MockLLM, offline) captured 2026-10-15. Do not hand-edit. */
const TRIAGE_DEMOS = {
  "kafka_lag": {
    "label": "Kafka consumer lag",
    "title": "Kafka consumer lag spiking on orders topic",
    "description": "Consumer group orders-svc lag is climbing rapidly and order processing latency is degraded. Suspected slow consumer or partition skew.",
    "logs": [
      {
        "level": "WARN",
        "service": "kafka-consumer",
        "message": "consumer group orders-svc lag rising: 160000 messages behind"
      },
      {
        "level": "ERROR",
        "service": "kafka-consumer",
        "message": "ConsumerLagExceeded: group orders-svc lag 480000 exceeds threshold 50000 on topic orders partition 7"
      },
      {
        "level": "ERROR",
        "service": "kafka-consumer",
        "message": "RebalanceInProgressException: consumer group rebalancing repeatedly, 3 attempts in 60s"
      },
      {
        "level": "WARN",
        "service": "orders-svc",
        "message": "downstream processing delayed; end-to-end order latency p99 42s"
      },
      {
        "level": "ERROR",
        "service": "kafka-consumer",
        "message": "ConsumerLagExceeded: lag 495000 on topic orders partition 12"
      }
    ],
    "investigator": "3 errors across 1 service(s) (kafka-consumer); top signatures: RebalanceInProgressException, orders, consumerlagexceeded, group; first error at 2026-10-15T10:01:12Z, latest at 2026-10-15T10:02:30Z.",
    "severity": "P2",
    "severity_reason": "degraded performance / elevated errors detected",
    "severity_line": "P2 \u2014 degraded performance / elevated errors detected",
    "retriever": "top=kafka-consumer-lag.md confidence=0.567 (k=3)",
    "retrieval_confidence": 0.567,
    "citations": [
      {
        "runbook": "kafka-consumer-lag.md",
        "section": "Diagnosis",
        "score": 0.5674
      },
      {
        "runbook": "kafka-consumer-lag.md",
        "section": "Symptoms",
        "score": 0.5434
      },
      {
        "runbook": "kafka-consumer-lag.md",
        "section": "Mitigation",
        "score": 0.5359
      }
    ],
    "planner": "6 steps, confidence=0.567",
    "plan_confidence": 0.567,
    "plan_steps": [
      "Per kafka-consumer-lag.md \u00a7 Diagnosis: Inspect consumer logs for `RebalanceInProgressException`, which indicates repeated rebalancing that stalls consumption.",
      "Per kafka-consumer-lag.md \u00a7 Symptoms: End-to-end processing latency degrades and downstream services report stale data.",
      "Per kafka-consumer-lag.md \u00a7 Mitigation: Restart the stalled consumer instances to clear any wedged poll loops, then verify the group rejoins cleanly.",
      "Per kafka-consumer-lag.md \u00a7 Mitigation: Rebalance partitions across the consumer group so load is spread evenly and no single partition stays hot.",
      "Per kafka-consumer-lag.md \u00a7 Mitigation: Scale out the consumer group by adding instances up to the partition count when lag is uniform and CPU on consumers is saturated.",
      "Per kafka-consumer-lag.md \u00a7 Mitigation: Reset the consumer offset to the latest committed offset for poison-pill messages that block a partition, and replay from the last good offset once the bad record is quarantined."
    ],
    "plan_citations": [
      {
        "runbook": "kafka-consumer-lag.md",
        "section": "Diagnosis"
      },
      {
        "runbook": "kafka-consumer-lag.md",
        "section": "Symptoms"
      },
      {
        "runbook": "kafka-consumer-lag.md",
        "section": "Mitigation"
      }
    ],
    "latency_ms": 2.8
  },
  "db_failover": {
    "label": "Postgres failover",
    "title": "Postgres primary down, automatic failover in progress",
    "description": "The Postgres primary hit a storage fault and Patroni initiated failover to a replica. Writes were briefly unavailable; reads served stale data.",
    "logs": [
      {
        "level": "ERROR",
        "service": "postgres-primary",
        "message": "FATAL: could not open file \"base/16384/24576\": Input/output error; primary storage fault"
      },
      {
        "level": "WARN",
        "service": "patroni",
        "message": "primary postgres-primary unreachable for 3s, starting leader election"
      },
      {
        "level": "ERROR",
        "service": "patroni",
        "message": "FailoverInitiated: promoting replica postgres-replica-2 to primary"
      },
      {
        "level": "ERROR",
        "service": "api-gateway",
        "message": "DatabaseConnectionError: 42 connection attempts failed during failover window"
      },
      {
        "level": "INFO",
        "service": "patroni",
        "message": "failover complete; postgres-replica-2 is now primary, writes resumed"
      }
    ],
    "investigator": "3 errors across 3 service(s) (postgres-primary, patroni, api-gateway); top signatures: FATAL, DatabaseConnectionError, primary, replica; first error at 2026-10-15T11:00:00Z, latest at 2026-10-15T11:00:20Z.",
    "severity": "P1",
    "severity_reason": "critical keywords indicate full outage or data loss",
    "severity_line": "P1 \u2014 critical keywords indicate full outage or data loss",
    "retriever": "top=postgres-failover.md confidence=0.561 (k=3)",
    "retrieval_confidence": 0.561,
    "citations": [
      {
        "runbook": "postgres-failover.md",
        "section": "Symptoms",
        "score": 0.5606
      },
      {
        "runbook": "postgres-failover.md",
        "section": "Mitigation",
        "score": 0.5251
      },
      {
        "runbook": "postgres-failover.md",
        "section": "Diagnosis",
        "score": 0.4871
      }
    ],
    "planner": "6 steps, confidence=0.561",
    "plan_confidence": 0.561,
    "plan_steps": [
      "Per postgres-failover.md \u00a7 Symptoms: Primary Postgres becomes unreachable: `FATAL` I/O errors in the primary log, connection failures from app services, and Patroni starting a leader election.",
      "Per postgres-failover.md \u00a7 Mitigation: Promote the most caught-up replica to primary with `patronictl failover` to restore writes quickly.",
      "Per postgres-failover.md \u00a7 Mitigation: Drain connections from the old primary and re-point application connection strings or the proxy to the new primary.",
      "Per postgres-failover.md \u00a7 Mitigation: Replay any WAL segments that had not yet shipped before the failure to minimize data loss.",
      "Per postgres-failover.md \u00a7 Mitigation: Failover the read replicas to follow the new primary so the topology is consistent, then restart the failed node as a replica once its storage is replaced.",
      "Per postgres-failover.md \u00a7 Diagnosis: Confirm the primary is truly down via Patroni cluster state, not just a network partition \u2014 check `patronictl list` from two availability zones."
    ],
    "plan_citations": [
      {
        "runbook": "postgres-failover.md",
        "section": "Symptoms"
      },
      {
        "runbook": "postgres-failover.md",
        "section": "Mitigation"
      },
      {
        "runbook": "postgres-failover.md",
        "section": "Diagnosis"
      }
    ],
    "latency_ms": 1.1
  },
  "deploy_regression": {
    "label": "Deploy regression",
    "title": "Deploy regression: v3.0.0-rc1 canary showing 500 spike",
    "description": "Canary of v3.0.0-rc1 is throwing NullPointerException in the pricing path with an 8% HTTP 500 rate. Stable pods are healthy. Likely bad deploy, rollback candidate.",
    "logs": [
      {
        "level": "INFO",
        "service": "deployer",
        "message": "canary deploy v3.0.0-rc1 to 5% of fleet started"
      },
      {
        "level": "ERROR",
        "service": "checkout-svc",
        "message": "NullPointerException in PricingEngine after deploy v3.0.0-rc1; 500s on /price"
      },
      {
        "level": "ERROR",
        "service": "checkout-svc",
        "message": "HTTP 500 spike: 8.2% error rate on canary pods running v3.0.0-rc1 vs 0.1% on stable"
      },
      {
        "level": "WARN",
        "service": "deployer",
        "message": "canary analysis failed for v3.0.0-rc1: error budget burn 12x baseline; auto-rollback armed"
      }
    ],
    "investigator": "2 errors across 1 service(s) (checkout-svc); top signatures: NullPointerException, 500, nullpointerexception, pricingengine; first error at 2026-10-15T12:05:00Z, latest at 2026-10-15T12:05:30Z.",
    "severity": "P2",
    "severity_reason": "degraded performance / elevated errors detected",
    "severity_line": "P2 \u2014 degraded performance / elevated errors detected",
    "retriever": "top=deploy-rollback.md confidence=0.495 (k=3)",
    "retrieval_confidence": 0.495,
    "citations": [
      {
        "runbook": "deploy-rollback.md",
        "section": "Symptoms",
        "score": 0.4947
      },
      {
        "runbook": "deploy-rollback.md",
        "section": "Mitigation",
        "score": 0.4789
      },
      {
        "runbook": "deploy-rollback.md",
        "section": "Escalation",
        "score": 0.4492
      }
    ],
    "planner": "6 steps, confidence=0.495",
    "plan_confidence": 0.495,
    "plan_steps": [
      "Per deploy-rollback.md \u00a7 Symptoms: A new deploy or canary shows elevated HTTP 500s, new exception types (e.g.",
      "Per deploy-rollback.md \u00a7 Mitigation: Rollback the canary to the last known-good version immediately when the error rate exceeds the rollback threshold \u2014 do not wait for a fix forward.",
      "Per deploy-rollback.md \u00a7 Mitigation: Revert any associated config or feature-flag changes that shipped with the deploy.",
      "Per deploy-rollback.md \u00a7 Mitigation: Drain the canary pods and cordon the bad version so the scheduler cannot re-place it.",
      "Per deploy-rollback.md \u00a7 Mitigation: If the deploy already went fleet-wide, halt the rollout, pin the fleet to the previous version, and replay the failed canary analysis on the reverted build to confirm recovery.",
      "Per deploy-rollback.md \u00a7 Escalation: Page the service owner if rollback does not clear the errors (suggesting the cause is not the deploy), or if the bad version wrote corrupt data that needs a backfill."
    ],
    "plan_citations": [
      {
        "runbook": "deploy-rollback.md",
        "section": "Symptoms"
      },
      {
        "runbook": "deploy-rollback.md",
        "section": "Mitigation"
      },
      {
        "runbook": "deploy-rollback.md",
        "section": "Escalation"
      }
    ],
    "latency_ms": 0.9
  }
};
