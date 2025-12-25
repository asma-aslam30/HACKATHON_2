-- Task Statistics SQL Views
-- Provides productivity insights and dashboard metrics

-- View: Task completion velocity by user
CREATE VIEW task_completion_velocity AS
SELECT
    user_id,
    COUNT(*) as total_completed_tasks,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as avg_completion_hours,
    MIN(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as min_completion_hours,
    MAX(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as max_completion_hours,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as median_completion_hours
FROM tasks
WHERE completed_at IS NOT NULL
GROUP BY user_id;

-- View: Task priority distribution
CREATE VIEW task_priority_distribution AS
SELECT
    user_id,
    priority,
    COUNT(*) as task_count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY user_id) as percentage
FROM tasks
GROUP BY user_id, priority;

-- View: Due date accuracy
CREATE VIEW due_date_accuracy AS
SELECT
    user_id,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN completed_at <= due_date THEN 1 END) as completed_on_time,
    COUNT(CASE WHEN completed_at > due_date THEN 1 END) as completed_late,
    COUNT(CASE WHEN completed_at <= due_date THEN 1 END) * 100.0 / COUNT(*) as on_time_percentage
FROM tasks
WHERE completed_at IS NOT NULL AND due_date IS NOT NULL
GROUP BY user_id;

-- View: Average task lifetime
CREATE VIEW average_task_lifetime AS
SELECT
    user_id,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/86400) as avg_lifetime_days,
    MIN(EXTRACT(EPOCH FROM (completed_at - created_at))/86400) as min_lifetime_days,
    MAX(EXTRACT(EPOCH FROM (completed_at - created_at))/86400) as max_lifetime_days
FROM tasks
WHERE completed_at IS NOT NULL
GROUP BY user_id;

-- View: Task completion by priority
CREATE VIEW task_completion_by_priority AS
SELECT
    user_id,
    priority,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(*) as completion_rate
FROM tasks
GROUP BY user_id, priority;

-- View: Weekly task trends
CREATE VIEW weekly_task_trends AS
SELECT
    user_id,
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as tasks_created,
    COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as tasks_completed,
    COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(*) as weekly_completion_rate
FROM tasks
GROUP BY user_id, DATE_TRUNC('week', created_at);

-- View: Task backlog analysis
CREATE VIEW task_backlog_analysis AS
SELECT
    user_id,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN completed_at IS NULL THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN due_date < NOW() AND completed_at IS NULL THEN 1 END) as overdue_tasks,
    COUNT(CASE WHEN priority = 'urgent' AND completed_at IS NULL THEN 1 END) as urgent_pending_tasks
FROM tasks
GROUP BY user_id;

-- View: Task category performance
CREATE VIEW task_category_performance AS
SELECT
    user_id,
    category,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_tasks,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/86400) as avg_completion_days,
    COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(*) as completion_rate
FROM tasks
WHERE category IS NOT NULL
GROUP BY user_id, category;

-- Materialized view for dashboard performance (refreshed periodically)
CREATE MATERIALIZED VIEW dashboard_task_stats AS
SELECT
    tcv.user_id,
    tcv.total_completed_tasks,
    tcv.avg_completion_hours,
    tcv.median_completion_hours,
    dda.on_time_percentage,
    atla.avg_lifetime_days,
    tba.pending_tasks,
    tba.overdue_tasks,
    tba.urgent_pending_tasks,
    NOW() as last_updated
FROM task_completion_velocity tcv
JOIN due_date_accuracy dda ON tcv.user_id = dda.user_id
JOIN average_task_lifetime atla ON tcv.user_id = atla.user_id
JOIN task_backlog_analysis tba ON tcv.user_id = tba.user_id;

-- Index for performance optimization
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_tasks_user_priority ON tasks(user_id, priority);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date, completed_at);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_task_stats;
END;
$$ LANGUAGE plpgsql;