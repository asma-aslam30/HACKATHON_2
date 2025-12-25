"""
Task statistics API for the todo application
Provides productivity insights and dashboard metrics
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum
import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import SQLModel, Session, select, func
from sqlalchemy.orm import joinedload
from redis import Redis
import json
import pickle

from models.task import Task  # Assuming Task model exists
from database import get_session
from core.config import settings

router = APIRouter(prefix="/api/stats", tags=["statistics"])

# Redis connection
redis_client = Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    db=settings.redis_db,
    password=settings.redis_password,
    decode_responses=False
)

# Request/Response models
class TimeRange(str, Enum):
    TODAY = "today"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"


class TaskStatsResponse(BaseModel):
    """Response model for task statistics"""
    user_id: str
    total_completed_tasks: int
    avg_completion_hours: float
    median_completion_hours: float
    on_time_percentage: float
    avg_lifetime_days: float
    pending_tasks: int
    overdue_tasks: int
    urgent_pending_tasks: int
    last_updated: datetime


class PriorityDistributionResponse(BaseModel):
    """Response model for priority distribution"""
    user_id: str
    priority: str
    task_count: int
    percentage: float


class CompletionByPriorityResponse(BaseModel):
    """Response model for completion by priority"""
    user_id: str
    priority: str
    total_tasks: int
    completed_tasks: int
    completion_rate: float


class TaskTrendsResponse(BaseModel):
    """Response model for task trends"""
    user_id: str
    week: str
    tasks_created: int
    tasks_completed: int
    weekly_completion_rate: float


class StatsCacheService:
    """Service for caching statistics in Redis"""

    @staticmethod
    def _get_cache_key(user_id: str, stat_type: str, time_range: Optional[str] = None) -> str:
        """Generate cache key for statistics"""
        key = f"stats:{stat_type}:{user_id}"
        if time_range:
            key += f":{time_range}"
        return key

    @staticmethod
    async def get_cached_stats(user_id: str, stat_type: str, time_range: Optional[str] = None) -> Optional[Any]:
        """Get cached statistics from Redis"""
        try:
            cache_key = StatsCacheService._get_cache_key(user_id, stat_type, time_range)
            cached_data = redis_client.get(cache_key)
            if cached_data:
                return pickle.loads(cached_data)
            return None
        except Exception as e:
            logging.error(f"Error getting cached stats: {e}")
            return None

    @staticmethod
    async def set_cached_stats(user_id: str, stat_type: str, data: Any, time_range: Optional[str] = None, ttl: int = 300) -> None:
        """Set cached statistics in Redis"""
        try:
            cache_key = StatsCacheService._get_cache_key(user_id, stat_type, time_range)
            redis_client.setex(cache_key, ttl, pickle.dumps(data))
        except Exception as e:
            logging.error(f"Error setting cached stats: {e}")


class TaskStatsService:
    """Service for calculating task statistics"""

    @staticmethod
    async def get_user_task_stats(
        user_id: str,
        session: Session,
        time_range: Optional[TimeRange] = None
    ) -> Optional[TaskStatsResponse]:
        """Get comprehensive task statistics for a user"""

        # Check cache first
        cached_stats = await StatsCacheService.get_cached_stats(user_id, "dashboard", time_range.value if time_range else None)
        if cached_stats:
            return cached_stats

        # Calculate statistics from database
        query = select(Task).where(Task.user_id == user_id)

        if time_range:
            now = datetime.utcnow()
            if time_range == TimeRange.TODAY:
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            elif time_range == TimeRange.WEEK:
                start_date = now - timedelta(days=now.weekday())
            elif time_range == TimeRange.MONTH:
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            elif time_range == TimeRange.QUARTER:
                quarter_start = ((now.month - 1) // 3) * 3 + 1
                start_date = now.replace(month=quarter_start, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:  # YEAR
                start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

            query = query.where(Task.created_at >= start_date)

        tasks = session.exec(query).all()

        if not tasks:
            return None

        # Calculate statistics
        completed_tasks = [t for t in tasks if t.completed_at]
        pending_tasks = [t for t in tasks if not t.completed_at]
        overdue_tasks = [t for t in pending_tasks if t.due_date and t.due_date < datetime.utcnow()]
        urgent_pending_tasks = [t for t in pending_tasks if t.priority == "urgent"]

        total_completed_tasks = len(completed_tasks)
        total_pending_tasks = len(pending_tasks)
        total_overdue_tasks = len(overdue_tasks)
        total_urgent_pending_tasks = len(urgent_pending_tasks)

        # Calculate completion hours
        completion_times = []
        for task in completed_tasks:
            if task.completed_at and task.created_at:
                completion_time = (task.completed_at - task.created_at).total_seconds() / 3600
                completion_times.append(completion_time)

        avg_completion_hours = sum(completion_times) / len(completion_times) if completion_times else 0
        median_completion_hours = sorted(completion_times)[len(completion_times)//2] if completion_times else 0

        # Calculate on-time percentage
        on_time_tasks = [t for t in completed_tasks if t.due_date and t.completed_at <= t.due_date]
        on_time_percentage = (len(on_time_tasks) / len(completed_tasks) * 100) if completed_tasks else 0

        # Calculate average lifetime
        lifetimes = []
        for task in completed_tasks:
            if task.completed_at and task.created_at:
                lifetime = (task.completed_at - task.created_at).total_seconds() / 86400
                lifetimes.append(lifetime)

        avg_lifetime_days = sum(lifetimes) / len(lifetimes) if lifetimes else 0

        # Create response
        stats = TaskStatsResponse(
            user_id=user_id,
            total_completed_tasks=total_completed_tasks,
            avg_completion_hours=avg_completion_hours,
            median_completion_hours=median_completion_hours,
            on_time_percentage=on_time_percentage,
            avg_lifetime_days=avg_lifetime_days,
            pending_tasks=total_pending_tasks,
            overdue_tasks=total_overdue_tasks,
            urgent_pending_tasks=total_urgent_pending_tasks,
            last_updated=datetime.utcnow()
        )

        # Cache the result
        await StatsCacheService.set_cached_stats(
            user_id, "dashboard", stats, time_range.value if time_range else None
        )

        return stats

    @staticmethod
    async def get_priority_distribution(
        user_id: str,
        session: Session,
        time_range: Optional[TimeRange] = None
    ) -> List[PriorityDistributionResponse]:
        """Get task priority distribution for a user"""

        cached_distribution = await StatsCacheService.get_cached_stats(user_id, "priority", time_range.value if time_range else None)
        if cached_distribution:
            return cached_distribution

        query = select(Task).where(Task.user_id == user_id)

        if time_range:
            now = datetime.utcnow()
            if time_range == TimeRange.TODAY:
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            elif time_range == TimeRange.WEEK:
                start_date = now - timedelta(days=now.weekday())
            elif time_range == TimeRange.MONTH:
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            elif time_range == TimeRange.QUARTER:
                quarter_start = ((now.month - 1) // 3) * 3 + 1
                start_date = now.replace(month=quarter_start, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:  # YEAR
                start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

            query = query.where(Task.created_at >= start_date)

        tasks = session.exec(query).all()

        # Count by priority
        priority_counts = {}
        for task in tasks:
            priority = task.priority or "normal"
            priority_counts[priority] = priority_counts.get(priority, 0) + 1

        total_tasks = len(tasks)
        distribution = []

        for priority, count in priority_counts.items():
            percentage = (count / total_tasks * 100) if total_tasks > 0 else 0
            distribution.append(
                PriorityDistributionResponse(
                    user_id=user_id,
                    priority=priority,
                    task_count=count,
                    percentage=round(percentage, 2)
                )
            )

        await StatsCacheService.set_cached_stats(
            user_id, "priority", distribution, time_range.value if time_range else None
        )

        return distribution

    @staticmethod
    async def get_completion_by_priority(
        user_id: str,
        session: Session,
        time_range: Optional[TimeRange] = None
    ) -> List[CompletionByPriorityResponse]:
        """Get task completion rates by priority"""

        cached_completion = await StatsCacheService.get_cached_stats(user_id, "completion", time_range.value if time_range else None)
        if cached_completion:
            return cached_completion

        query = select(Task).where(Task.user_id == user_id)

        if time_range:
            now = datetime.utcnow()
            if time_range == TimeRange.TODAY:
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            elif time_range == TimeRange.WEEK:
                start_date = now - timedelta(days=now.weekday())
            elif time_range == TimeRange.MONTH:
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            elif time_range == TimeRange.QUARTER:
                quarter_start = ((now.month - 1) // 3) * 3 + 1
                start_date = now.replace(month=quarter_start, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:  # YEAR
                start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

            query = query.where(Task.created_at >= start_date)

        tasks = session.exec(query).all()

        # Group by priority
        priority_tasks = {}
        for task in tasks:
            priority = task.priority or "normal"
            if priority not in priority_tasks:
                priority_tasks[priority] = []
            priority_tasks[priority].append(task)

        completion_stats = []
        for priority, tasks in priority_tasks.items():
            total_tasks = len(tasks)
            completed_tasks = len([t for t in tasks if t.completed_at])
            completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

            completion_stats.append(
                CompletionByPriorityResponse(
                    user_id=user_id,
                    priority=priority,
                    total_tasks=total_tasks,
                    completed_tasks=completed_tasks,
                    completion_rate=round(completion_rate, 2)
                )
            )

        await StatsCacheService.set_cached_stats(
            user_id, "completion", completion_stats, time_range.value if time_range else None
        )

        return completion_stats

    @staticmethod
    async def get_task_trends(
        user_id: str,
        session: Session,
        weeks_back: int = 4
    ) -> List[TaskTrendsResponse]:
        """Get task creation and completion trends over time"""

        cached_trends = await StatsCacheService.get_cached_stats(user_id, "trends", str(weeks_back))
        if cached_trends:
            return cached_trends

        start_date = datetime.utcnow() - timedelta(weeks=weeks_back)
        query = select(Task).where(
            Task.user_id == user_id,
            Task.created_at >= start_date
        )

        tasks = session.exec(query).all()

        # Group by week
        weekly_data = {}
        for task in tasks:
            week_start = task.created_at.replace(
                day=task.created_at.day - task.created_at.weekday(),
                hour=0, minute=0, second=0, microsecond=0
            )
            week_str = week_start.strftime("%Y-%U")

            if week_str not in weekly_data:
                weekly_data[week_str] = {
                    "tasks_created": 0,
                    "tasks_completed": 0
                }

            weekly_data[week_str]["tasks_created"] += 1

            if task.completed_at:
                weekly_data[week_str]["tasks_completed"] += 1

        trends = []
        for week_str, data in weekly_data.items():
            completion_rate = (data["tasks_completed"] / data["tasks_created"] * 100) if data["tasks_created"] > 0 else 0
            trends.append(
                TaskTrendsResponse(
                    user_id=user_id,
                    week=week_str,
                    tasks_created=data["tasks_created"],
                    tasks_completed=data["tasks_completed"],
                    weekly_completion_rate=round(completion_rate, 2)
                )
            )

        await StatsCacheService.set_cached_stats(user_id, "trends", trends, str(weeks_back))

        return trends


# API endpoints
@router.get("/dashboard/{user_id}", response_model=TaskStatsResponse)
async def get_dashboard_stats(
    user_id: str,
    time_range: Optional[TimeRange] = Query(None),
    session: Session = Depends(get_session)
):
    """Get comprehensive dashboard statistics for a user"""
    stats = await TaskStatsService.get_user_task_stats(user_id, session, time_range)
    if not stats:
        raise HTTPException(status_code=404, detail="No statistics found for user")
    return stats


@router.get("/priority-distribution/{user_id}", response_model=List[PriorityDistributionResponse])
async def get_priority_distribution(
    user_id: str,
    time_range: Optional[TimeRange] = Query(None),
    session: Session = Depends(get_session)
):
    """Get task priority distribution for a user"""
    distribution = await TaskStatsService.get_priority_distribution(user_id, session, time_range)
    return distribution


@router.get("/completion-by-priority/{user_id}", response_model=List[CompletionByPriorityResponse])
async def get_completion_by_priority(
    user_id: str,
    time_range: Optional[TimeRange] = Query(None),
    session: Session = Depends(get_session)
):
    """Get task completion rates by priority for a user"""
    completion_stats = await TaskStatsService.get_completion_by_priority(user_id, session, time_range)
    return completion_stats


@router.get("/trends/{user_id}", response_model=List[TaskTrendsResponse])
async def get_task_trends(
    user_id: str,
    weeks_back: int = Query(4, ge=1, le=52),
    session: Session = Depends(get_session)
):
    """Get task creation and completion trends for a user"""
    trends = await TaskStatsService.get_task_trends(user_id, session, weeks_back)
    return trends


@router.get("/refresh-cache/{user_id}")
async def refresh_user_stats_cache(
    user_id: str,
    stat_type: str = Query(..., description="Type of stats to refresh: all, dashboard, priority, completion, trends")
):
    """Refresh cached statistics for a user"""
    if stat_type == "all":
        # Clear all cached stats for user
        for stat_type in ["dashboard", "priority", "completion", "trends"]:
            pattern = f"stats:{stat_type}:{user_id}:*"
            keys = redis_client.keys(pattern)
            if keys:
                redis_client.delete(*keys)
    else:
        # Clear specific stat type
        pattern = f"stats:{stat_type}:{user_id}:*"
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)

    return {"message": f"Cache refreshed for {stat_type} stats for user {user_id}"}


# Background task to refresh materialized views periodically
async def refresh_materialized_views():
    """Background task to refresh materialized views"""
    # This would typically run as a scheduled task
    # Implementation depends on your task queue system (Celery, etc.)
    pass