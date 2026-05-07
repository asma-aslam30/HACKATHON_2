"""
Dapr Publisher — publishes events via Dapr sidecar (Phase V).
Dapr abstracts Kafka so the app doesn't need kafka-python.
Falls back to no-op if Dapr is not running.
"""

import os
import logging
from datetime import datetime
import httpx

logger = logging.getLogger(__name__)

DAPR_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_URL = f"http://localhost:{DAPR_PORT}"
DAPR_ENABLED = os.getenv("DAPR_ENABLED", "false").lower() == "true"

PUBSUB_NAME = "kafka-pubsub"


async def publish(topic: str, data: dict):
    """Publish event via Dapr sidecar."""
    if not DAPR_ENABLED:
        return

    url = f"{DAPR_URL}/v1.0/publish/{PUBSUB_NAME}/{topic}"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(url, json=data)
            resp.raise_for_status()
            logger.debug(f"Dapr published to {topic}: {data.get('event_type', '')}")
    except Exception as e:
        logger.warning(f"Dapr publish failed (topic={topic}): {e}")


async def publish_task_event(event_type: str, task_id: int, task_data: dict, user_id: str):
    await publish("task-events", {
        "event_type": event_type,
        "task_id": task_id,
        "task_data": task_data,
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat(),
    })


async def publish_reminder(task_id: int, title: str, due_at: str, remind_at: str, user_id: str):
    await publish("reminders", {
        "task_id": task_id,
        "title": title,
        "due_at": due_at,
        "remind_at": remind_at,
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat(),
    })
