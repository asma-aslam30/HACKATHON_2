"""
Kafka consumer for notification service
"""
import asyncio
import json
import logging
from typing import Dict, Any

from kafka import KafkaConsumer
from .models import NotificationEvent, NotificationType, NotificationPriority


class NotificationConsumer:
    """Kafka consumer for processing notification events"""

    def __init__(self, bootstrap_servers: list, group_id: str = "notification-service"):
        self.bootstrap_servers = bootstrap_servers
        self.group_id = group_id
        self.consumer = KafkaConsumer(
            'task-notifications',
            bootstrap_servers=bootstrap_servers,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            group_id=group_id,
            auto_offset_reset='earliest'
        )
        self.logger = logging.getLogger(__name__)

    async def start_consuming(self, notification_service):
        """Start consuming notification events"""
        self.logger.info("Starting notification consumer...")
        for message in self.consumer:
            try:
                event_data = message.value
                event = NotificationEvent(
                    event_type=NotificationType(event_data['event_type']),
                    user_id=event_data['user_id'],
                    task_id=event_data.get('task_id'),
                    task_title=event_data.get('task_title'),
                    due_date=event_data.get('due_date'),
                    project_id=event_data.get('project_id'),
                    priority=NotificationPriority(event_data.get('priority', 'medium')),
                    content=event_data.get('content', {}),
                    timestamp=event_data.get('timestamp')
                )

                # Process the notification event
                await notification_service.process_notification_event(event)

            except Exception as e:
                self.logger.error(f"Error processing notification event: {e}")
                # TODO: Send to dead letter queue

    def stop(self):
        """Stop the consumer"""
        self.consumer.close()
