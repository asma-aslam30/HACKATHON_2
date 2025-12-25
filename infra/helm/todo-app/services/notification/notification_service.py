"""
Notification service for the todo application
Implements multi-channel notification system with Kafka integration
"""
import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum
from dataclasses import dataclass
from abc import ABC, abstractmethod

from kafka import KafkaConsumer, KafkaProducer
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import redis

# Models
class NotificationChannel(str, Enum):
    EMAIL = "email"
    SLACK = "slack"
    PUSH = "push"
    IN_APP = "in_app"


class NotificationType(str, Enum):
    TASK_DUE_SOON = "task.due_soon"
    DAILYDIGEST = "daily.digest"
    TASK_COMPLETED = "task.completed"
    TEAM_COLLABORATION = "team.collaboration"
    SYSTEM = "system"


class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


@dataclass
class NotificationEvent:
    """Data class for notification events"""
    event_type: NotificationType
    user_id: str
    task_id: Optional[str] = None
    task_title: Optional[str] = None
    due_date: Optional[datetime] = None
    project_id: Optional[str] = None
    priority: Optional[NotificationPriority] = None
    content: Optional[Dict[str, Any]] = None
    timestamp: datetime = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()


class NotificationPreference(BaseModel):
    """User notification preferences"""
    user_id: str
    email_enabled: bool = True
    email_frequency: str = "immediate"  # immediate, daily, weekly, never
    slack_enabled: bool = False
    push_enabled: bool = True
    in_app_enabled: bool = True
    daily_digest_time: str = "09:00"  # HH:MM format
    timezone: str = "UTC"
    channel_preferences: Dict[NotificationType, List[NotificationChannel]] = {
        NotificationType.TASK_DUE_SOON: [NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.IN_APP],
        NotificationType.DAILYDIGEST: [NotificationChannel.EMAIL],
        NotificationType.TASK_COMPLETED: [NotificationChannel.IN_APP],
        NotificationType.TEAM_COLLABORATION: [NotificationChannel.EMAIL, NotificationChannel.SLACK, NotificationChannel.PUSH, NotificationChannel.IN_APP],
        NotificationType.SYSTEM: [NotificationChannel.EMAIL, NotificationChannel.IN_APP]
    }


# Channel implementations
class NotificationChannelHandler(ABC):
    """Abstract base class for notification channel handlers"""

    @abstractmethod
    async def send_notification(self, event: NotificationEvent, user_prefs: NotificationPreference) -> bool:
        """Send notification via this channel"""
        pass


class EmailChannelHandler(NotificationChannelHandler):
    """Email notification handler"""

    def __init__(self, smtp_host: str, smtp_port: int, smtp_user: str, smtp_password: str, from_email: str):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.smtp_user = smtp_user
        self.smtp_password = smtp_password
        self.from_email = from_email
        self.logger = logging.getLogger(__name__)

    async def send_notification(self, event: NotificationEvent, user_prefs: NotificationPreference) -> bool:
        """Send email notification"""
        try:
            # Determine subject and content based on event type
            subject, html_content = await self._create_email_content(event)

            # Create email message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = f"user_{event.user_id}@example.com"  # This would come from user service

            # Create HTML part
            html_part = MIMEText(html_content, "html")
            msg.attach(html_part)

            # Send email
            async with aiosmtplib.SMTP(
                hostname=self.smtp_host,
                port=self.smtp_port,
                use_tls=True
            ) as server:
                await server.login(self.smtp_user, self.smtp_password)
                await server.send_message(msg)

            self.logger.info(f"Email notification sent for user {event.user_id}, event {event.event_type}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to send email notification: {e}")
            return False

    async def _create_email_content(self, event: NotificationEvent) -> tuple[str, str]:
        """Create email subject and content based on event type"""
        if event.event_type == NotificationType.TASK_DUE_SOON:
            subject = f"Task Due Soon: {event.task_title}"
            html_content = f"""
            <html>
                <body>
                    <h2>Task Due Soon</h2>
                    <p>Your task <strong>{event.task_title}</strong> is due soon.</p>
                    <p>Due Date: {event.due_date}</p>
                    <p>Priority: {event.priority}</p>
                    <a href="https://todo-app.com/task/{event.task_id}">View Task</a>
                </body>
            </html>
            """
        elif event.event_type == NotificationType.DAILYDIGEST:
            subject = "Daily Task Digest"
            html_content = f"""
            <html>
                <body>
                    <h2>Daily Task Digest</h2>
                    <p>Here's your daily summary of tasks.</p>
                    <p>Upcoming tasks: {len(event.content.get('upcoming_tasks', []))}</p>
                    <p>Completed tasks: {event.content.get('completed_tasks_count', 0)}</p>
                    <p>Overdue tasks: {event.content.get('overdue_tasks_count', 0)}</p>
                </body>
            </html>
            """
        else:
            subject = f"Notification: {event.event_type.value.replace('.', ' ').title()}"
            html_content = f"""
            <html>
                <body>
                    <h2>{event.event_type.value.replace('.', ' ').title()}</h2>
                    <p>{event.task_title or 'New notification'}</p>
                </body>
            </html>
            """

        return subject, html_content


class SlackChannelHandler(NotificationChannelHandler):
    """Slack notification handler"""

    def __init__(self, slack_bot_token: str, default_channel: str = None):
        self.slack_bot_token = slack_bot_token
        self.default_channel = default_channel
        self.client = httpx.AsyncClient(
            headers={"Authorization": f"Bearer {slack_bot_token}"},
            timeout=10.0
        )
        self.logger = logging.getLogger(__name__)

    async def send_notification(self, event: NotificationEvent, user_prefs: NotificationPreference) -> bool:
        """Send Slack notification"""
        try:
            # Get user's Slack ID from user service
            user_slack_id = await self._get_user_slack_id(event.user_id)

            if not user_slack_id:
                self.logger.warning(f"No Slack ID found for user {event.user_id}")
                return False

            # Create message based on event type
            message = await self._create_slack_message(event)

            # Send message to user
            response = await self.client.post(
                "https://slack.com/api/chat.postMessage",
                json={
                    "channel": user_slack_id,
                    "text": message
                }
            )

            if response.status_code == 200 and response.json().get("ok"):
                self.logger.info(f"Slack notification sent for user {event.user_id}, event {event.event_type}")
                return True
            else:
                self.logger.error(f"Failed to send Slack notification: {response.text}")
                return False

        except Exception as e:
            self.logger.error(f"Failed to send Slack notification: {e}")
            return False

    async def _get_user_slack_id(self, user_id: str) -> Optional[str]:
        """Get user's Slack ID from user service"""
        # This would typically call a user service to get Slack ID
        # For now, return a mock value
        return f"U{user_id[:8]}"  # Mock Slack ID

    async def _create_slack_message(self, event: NotificationEvent) -> str:
        """Create Slack message based on event type"""
        if event.event_type == NotificationType.TASK_DUE_SOON:
            return f"⏰ Task due soon: *{event.task_title}*\nDue: {event.due_date}"
        elif event.event_type == NotificationType.TEAM_COLLABORATION:
            return f"👥 You've been mentioned in a task: *{event.task_title}*"
        else:
            return f"🔔 {event.event_type.value}: {event.task_title or 'New notification'}"


class PushChannelHandler(NotificationChannelHandler):
    """Push notification handler"""

    def __init__(self, fcm_server_key: str):
        self.fcm_server_key = fcm_server_key
        self.client = httpx.AsyncClient(
            headers={
                "Authorization": f"key={self.fcm_server_key}",
                "Content-Type": "application/json"
            },
            timeout=10.0
        )
        self.logger = logging.getLogger(__name__)

    async def send_notification(self, event: NotificationEvent, user_prefs: NotificationPreference) -> bool:
        """Send push notification"""
        try:
            # Get user's device tokens from user service
            device_tokens = await self._get_user_device_tokens(event.user_id)

            if not device_tokens:
                self.logger.warning(f"No device tokens found for user {event.user_id}")
                return False

            # Create notification payload
            notification = await self._create_push_payload(event)

            # Send to each device token
            success_count = 0
            for token in device_tokens:
                response = await self.client.post(
                    "https://fcm.googleapis.com/fcm/send",
                    json={
                        "to": token,
                        "notification": notification,
                        "data": {
                            "event_type": event.event_type.value,
                            "task_id": event.task_id or "",
                            "user_id": event.user_id
                        }
                    }
                )

                if response.status_code == 200:
                    success_count += 1
                else:
                    self.logger.error(f"Failed to send push notification to {token}: {response.text}")

            self.logger.info(f"Push notification sent to {success_count}/{len(device_tokens)} devices for user {event.user_id}")
            return success_count > 0

        except Exception as e:
            self.logger.error(f"Failed to send push notification: {e}")
            return False

    async def _get_user_device_tokens(self, user_id: str) -> List[str]:
        """Get user's device tokens from user service"""
        # This would typically call a user service to get device tokens
        # For now, return a mock value
        return [f"device_token_for_{user_id}"]  # Mock device token

    async def _create_push_payload(self, event: NotificationEvent) -> Dict[str, str]:
        """Create push notification payload"""
        if event.event_type == NotificationType.TASK_DUE_SOON:
            return {
                "title": "Task Due Soon",
                "body": f"Your task '{event.task_title}' is due soon!"
            }
        elif event.event_type == NotificationType.TEAM_COLLABORATION:
            return {
                "title": "Team Collaboration",
                "body": f"You've been mentioned in task: {event.task_title}"
            }
        else:
            return {
                "title": "New Notification",
                "body": event.task_title or f"{event.event_type.value.replace('.', ' ').title()}"
            }


class InAppChannelHandler(NotificationChannelHandler):
    """In-app notification handler"""

    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        self.logger = logging.getLogger(__name__)

    async def send_notification(self, event: NotificationEvent, user_prefs: NotificationPreference) -> bool:
        """Send in-app notification"""
        try:
            # Create notification record
            notification_data = {
                "id": f"notif_{event.user_id}_{event.timestamp.isoformat()}",
                "user_id": event.user_id,
                "event_type": event.event_type.value,
                "task_id": event.task_id,
                "title": event.task_title or event.event_type.value.replace('.', ' ').title(),
                "content": event.content or {},
                "read": False,
                "created_at": event.timestamp.isoformat()
            }

            # Store in Redis for quick access
            notification_key = f"notifications:{event.user_id}:{notification_data['id']}"
            self.redis_client.hmset(notification_key, notification_data)
            self.redis_client.expire(notification_key, 86400 * 30)  # 30 days expiration

            # Add to user's notification list
            user_notifications_key = f"user_notifications:{event.user_id}"
            self.redis_client.lpush(user_notifications_key, notification_data['id'])
            self.redis_client.expire(user_notifications_key, 86400 * 30)

            # Update notification count
            count_key = f"notification_count:{event.user_id}"
            self.redis_client.incr(count_key)
            self.redis_client.expire(count_key, 86400 * 30)

            self.logger.info(f"In-app notification created for user {event.user_id}, event {event.event_type}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to create in-app notification: {e}")
            return False


class NotificationService:
    """Main notification service"""

    def __init__(
        self,
        kafka_bootstrap_servers: List[str],
        redis_client: redis.Redis,
        email_handler: EmailChannelHandler,
        slack_handler: SlackChannelHandler,
        push_handler: PushChannelHandler,
        in_app_handler: InAppChannelHandler
    ):
        self.kafka_bootstrap_servers = kafka_bootstrap_servers
        self.redis_client = redis_client
        self.email_handler = email_handler
        self.slack_handler = slack_handler
        self.push_handler = push_handler
        self.in_app_handler = in_app_handler
        self.logger = logging.getLogger(__name__)

        # Initialize Kafka producer
        self.kafka_producer = KafkaProducer(
            bootstrap_servers=kafka_bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            retries=3
        )

        # Initialize Kafka consumer
        self.kafka_consumer = KafkaConsumer(
            'task-notifications',
            bootstrap_servers=kafka_bootstrap_servers,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            group_id='notification-service'
        )

    async def start_consumer(self):
        """Start Kafka consumer to process notification events"""
        self.logger.info("Starting notification consumer...")
        for message in self.kafka_consumer:
            try:
                event_data = message.value
                event = NotificationEvent(
                    event_type=NotificationType(event_data['event_type']),
                    user_id=event_data['user_id'],
                    task_id=event_data.get('task_id'),
                    task_title=event_data.get('task_title'),
                    due_date=datetime.fromisoformat(event_data['due_date']) if event_data.get('due_date') else None,
                    project_id=event_data.get('project_id'),
                    priority=NotificationPriority(event_data.get('priority', 'medium')),
                    content=event_data.get('content', {}),
                    timestamp=datetime.fromisoformat(event_data['timestamp'])
                )

                # Process the notification event
                await self.process_notification_event(event)

            except Exception as e:
                self.logger.error(f"Error processing notification event: {e}")

    async def process_notification_event(self, event: NotificationEvent):
        """Process a notification event and send to appropriate channels"""
        # Get user preferences
        user_prefs = await self.get_user_preferences(event.user_id)
        if not user_prefs:
            self.logger.warning(f"No preferences found for user {event.user_id}")
            return

        # Determine channels based on preferences
        channels = user_prefs.channel_preferences.get(event.event_type, [])

        # Send notification to each enabled channel
        tasks = []
        if NotificationChannel.EMAIL in channels and user_prefs.email_enabled:
            tasks.append(self.email_handler.send_notification(event, user_prefs))

        if NotificationChannel.SLACK in channels and user_prefs.slack_enabled:
            tasks.append(self.slack_handler.send_notification(event, user_prefs))

        if NotificationChannel.PUSH in channels and user_prefs.push_enabled:
            tasks.append(self.push_handler.send_notification(event, user_prefs))

        if NotificationChannel.IN_APP in channels and user_prefs.in_app_enabled:
            tasks.append(self.in_app_handler.send_notification(event, user_prefs))

        # Execute all notification tasks concurrently
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            success_count = sum(1 for r in results if r is True)
            self.logger.info(f"Notification sent to {success_count}/{len(tasks)} channels for user {event.user_id}")

    async def get_user_preferences(self, user_id: str) -> Optional[NotificationPreference]:
        """Get user notification preferences"""
        # This would typically fetch from a database
        # For now, return default preferences
        return NotificationPreference(user_id=user_id)

    async def send_daily_digest(self, user_id: str):
        """Send daily digest notification"""
        # This would typically fetch user's tasks and create digest content
        content = {
            "upcoming_tasks": [],
            "completed_tasks_count": 0,
            "overdue_tasks_count": 0
        }

        event = NotificationEvent(
            event_type=NotificationType.DAILYDIGEST,
            user_id=user_id,
            content=content
        )

        await self.process_notification_event(event)

    async def publish_notification_event(self, event: NotificationEvent):
        """Publish notification event to Kafka"""
        event_data = {
            "event_type": event.event_type.value,
            "user_id": event.user_id,
            "task_id": event.task_id,
            "task_title": event.task_title,
            "due_date": event.due_date.isoformat() if event.due_date else None,
            "project_id": event.project_id,
            "priority": event.priority.value if event.priority else "medium",
            "content": event.content,
            "timestamp": event.timestamp.isoformat()
        }

        self.kafka_producer.send('task-notifications', value=event_data)
        self.kafka_producer.flush()

        self.logger.info(f"Published notification event: {event.event_type} for user {event.user_id}")


# Initialize service
async def init_notification_service() -> NotificationService:
    """Initialize notification service with dependencies"""
    # Redis client
    redis_client = redis.Redis(
        host="localhost",  # This would come from config
        port=6379,
        db=0
    )

    # Channel handlers
    email_handler = EmailChannelHandler(
        smtp_host="smtp.gmail.com",
        smtp_port=587,
        smtp_user="your-smtp-user",
        smtp_password="your-smtp-password",
        from_email="notifications@todo-app.com"
    )

    slack_handler = SlackChannelHandler(
        slack_bot_token="your-slack-bot-token"
    )

    push_handler = PushChannelHandler(
        fcm_server_key="your-fcm-server-key"
    )

    in_app_handler = InAppChannelHandler(
        redis_client=redis_client
    )

    # Notification service
    notification_service = NotificationService(
        kafka_bootstrap_servers=["localhost:9092"],  # This would come from config
        redis_client=redis_client,
        email_handler=email_handler,
        slack_handler=slack_handler,
        push_handler=push_handler,
        in_app_handler=in_app_handler
    )

    return notification_service


# Scheduler for cron jobs
scheduler = AsyncIOScheduler()

def setup_daily_digest_job():
    """Setup daily digest cron job"""
    async def send_daily_digests():
        """Send daily digests to all users"""
        # This would typically fetch all users and send digests
        # For now, just log
        logging.info("Sending daily digests...")

    # Schedule daily digest at 9 AM in user's timezone
    scheduler.add_job(
        send_daily_digests,
        CronTrigger(hour=9, minute=0),  # This would be per user's timezone
        id='daily_digest_job'
    )


# FastAPI app
app = FastAPI(title="Notification Service")

@app.on_event("startup")
async def startup_event():
    """Initialize notification service on startup"""
    global notification_service
    notification_service = await init_notification_service()

    # Start Kafka consumer in background
    asyncio.create_task(notification_service.start_consumer())

    # Setup scheduler
    setup_daily_digest_job()
    scheduler.start()


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    scheduler.shutdown()


@app.post("/api/notifications/test")
async def test_notification(user_id: str, event_type: NotificationType):
    """Test endpoint to send a notification"""
    event = NotificationEvent(
        event_type=event_type,
        user_id=user_id,
        task_title="Test Task",
        task_id="test-task-id"
    )

    await notification_service.process_notification_event(event)
    return {"message": "Notification sent successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
