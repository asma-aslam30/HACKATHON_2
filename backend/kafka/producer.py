"""
Kafka Event Producer — publishes task events to Redpanda/Kafka.
Used in Phase V. Gracefully disabled if Kafka is not configured.
"""

import os
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

_producer = None
KAFKA_ENABLED = bool(os.getenv("KAFKA_BOOTSTRAP_SERVERS"))


def get_producer():
    """Lazy-initialize Kafka producer. Returns None if Kafka not configured."""
    global _producer
    if not KAFKA_ENABLED:
        return None
    if _producer is not None:
        return _producer
    try:
        from kafka import KafkaProducer
        _producer = KafkaProducer(
            bootstrap_servers=os.getenv("KAFKA_BOOTSTRAP_SERVERS"),
            security_protocol="SASL_SSL",
            sasl_mechanism="SCRAM-SHA-256",
            sasl_plain_username=os.getenv("KAFKA_USERNAME", ""),
            sasl_plain_password=os.getenv("KAFKA_PASSWORD", ""),
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            acks="all",
            retries=3,
        )
        logger.info("Kafka producer initialized")
        return _producer
    except Exception as e:
        logger.warning(f"Kafka not available: {e}. Events will be skipped.")
        return None


def publish_task_event(
    event_type: str,
    task_id: int,
    task_data: dict,
    user_id: str,
):
    """
    Publish a task lifecycle event to the 'task-events' topic.

    event_type: created | updated | completed | deleted
    """
    producer = get_producer()
    if producer is None:
        return  # Kafka disabled — no-op

    event = {
        "event_type": event_type,
        "task_id": task_id,
        "task_data": task_data,
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat(),
    }
    try:
        producer.send("task-events", value=event)
        producer.flush(timeout=5)
        logger.debug(f"Published task event: {event_type} task_id={task_id}")
    except Exception as e:
        logger.error(f"Failed to publish task event: {e}")


def publish_reminder_event(
    task_id: int,
    title: str,
    due_at: str,
    remind_at: str,
    user_id: str,
):
    """Publish a reminder event to the 'reminders' topic."""
    producer = get_producer()
    if producer is None:
        return

    event = {
        "task_id": task_id,
        "title": title,
        "due_at": due_at,
        "remind_at": remind_at,
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat(),
    }
    try:
        producer.send("reminders", value=event)
        producer.flush(timeout=5)
        logger.debug(f"Published reminder event: task_id={task_id}")
    except Exception as e:
        logger.error(f"Failed to publish reminder event: {e}")
