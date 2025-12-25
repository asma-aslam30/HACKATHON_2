"""
Models for notification service
"""
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum
from pydantic import BaseModel


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


class NotificationEvent(BaseModel):
    """Notification event model"""
    event_type: NotificationType
    user_id: str
    task_id: Optional[str] = None
    task_title: Optional[str] = None
    due_date: Optional[datetime] = None
    project_id: Optional[str] = None
    priority: Optional[NotificationPriority] = None
    content: Optional[Dict[str, Any]] = None
    timestamp: datetime = None
