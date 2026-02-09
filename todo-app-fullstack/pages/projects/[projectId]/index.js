/**
 * Project Detail Page
 * Display project tasks, members, and progress
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Plus,
  Users,
  Settings,
  CheckCircle,
  Clock,
  TrendingUp,
  MoreVertical,
  Send
} from 'lucide-react';
import { useStore } from '../../../lib/store';
import ProgressBar, { CircularProgress } from '../../../components/shared/ProgressBar';
import RoleBadge from '../../../components/shared/RoleBadge';
import { hasPermission } from '../../../src/models/rolePermissions';
import { formatDate } from '../../../lib/utils';
import ProgressRequestModal from '../../../components/ProgressRequestModal';
import ProgressUpdateModal from '../../../components/ProgressUpdateModal';

export default function ProjectDetailPage() {
  const router = useRouter();
  const { projectId } = router.query;

  const user = useStore(state => state.user);
  const { loading, setLoading } = useStore();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [error, setError] = useState('');
  const [progressRequestModal, setProgressRequestModal] = useState(null);
  const [progressUpdateModal, setProgressUpdateModal] = useState(null);

  // Fetch project data
  useEffect(() => {
    if (projectId && user?.id) {
      fetchProjectData();
    }
  }, [projectId, user?.id]);

  const fetchProjectData = async () => {
    setLoading('projects', true);
    try {
      // Fetch project details
      const projectRes = await fetch(`/api/projects/${projectId}`, {
        headers: { 'x-user-id': user.id }
      });

      if (!projectRes.ok) {
        if (projectRes.status === 403) {
          setError('You do not have access to this project');
        } else {
          setError('Failed to load project');
        }
        return;
      }

      const projectData = await projectRes.json();
      setProject(projectData.project);

      // Fetch tasks
      const tasksRes = await fetch(`/api/projects/${projectId}/tasks`, {
        headers: { 'x-user-id': user.id }
      });

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks);
        setProgress(tasksData.progress);
      }
    } catch (err) {
      console.error('Failed to fetch project:', err);
      setError('Failed to load project');
    } finally {
      setLoading('projects', false);
    }
  };

  const handleUpdateProgress = async (taskId, percentage, note = '') => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ percentage, note })
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(tasks.map(t =>
          t.id === taskId ? { ...t, progress: percentage } : t
        ));
        // Refresh progress stats
        fetchProjectData();
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleRequestProgress = async (taskId, message = '') => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/request-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ message })
      });

      if (res.ok) {
        const data = await res.json();
        // Show success notification
        alert(`Progress update requested from ${data.assigneeCount} team member(s)`);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to request progress update');
      }
    } catch (err) {
      console.error('Failed to request progress:', err);
      alert(err.message || 'Failed to request progress update');
    }
  };

  const handleOpenProgressRequest = (task) => {
    setProgressRequestModal(task);
  };

  const handleCloseProgressRequest = () => {
    setProgressRequestModal(null);
  };

  const handleOpenProgressUpdate = (task) => {
    setProgressUpdateModal(task);
  };

  const handleCloseProgressUpdate = () => {
    setProgressUpdateModal(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Please log in to view this project</p>
      </div>
    );
  }

  if (loading.projects) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.push('/projects')}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) return null;

  const canManage = hasPermission(project.userRole, 'project.edit');
  const canCreateTasks = hasPermission(project.userRole, 'task.create');

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <RoleBadge role={project.userRole} />
              </div>
              {project.description && (
                <p className="text-gray-600 mt-1">{project.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {project.startDate && (
                  <span>Started {formatDate(project.startDate)}</span>
                )}
                {project.endDate && (
                  <span>Due {formatDate(project.endDate)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canCreateTasks && (
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                  <Plus className="w-5 h-5" />
                  Add Task
                </button>
              )}
              {canManage && (
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        {progress && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overall Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{progress.avgProgress}%</p>
                </div>
                <CircularProgress percentage={progress.avgProgress} size={50} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-xl font-bold text-gray-900">
                    {progress.completed}/{progress.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-xl font-bold text-gray-900">{progress.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completion Rate</p>
                  <p className="text-xl font-bold text-gray-900">{progress.completionRate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            {['tasks', 'members'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500 mb-4">No tasks yet</p>
                {canCreateTasks && (
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Create First Task
                  </button>
                )}
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {}}
                          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <h3 className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1 ml-7">{task.description}</p>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-3 ml-7">
                        <ProgressBar percentage={task.progress} size="sm" />
                      </div>

                      {/* Assignees */}
                      {task.assignments && task.assignments.length > 0 && (
                        <div className="mt-2 ml-7 flex items-center gap-2">
                          <span className="text-xs text-gray-500">Assigned to:</span>
                          <div className="flex -space-x-1">
                            {task.assignments.map((a) => (
                              <div
                                key={a.id}
                                className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center border-2 border-white"
                                title={a.user?.name}
                              >
                                {a.user?.name?.charAt(0)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Progress Update and Request Controls */}
                      <div className="mt-3 ml-7 flex items-center gap-2">
                        {/* Progress update button for assignees */}
                        {task.assignments && task.assignments.some(a => a.userId === user.id) && (
                          <button
                            onClick={() => handleOpenProgressUpdate(task)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 hover:bg-green-200 rounded-md transition-colors"
                          >
                            <TrendingUp className="w-3 h-3" />
                            Update Progress
                          </button>
                        )}

                        {/* Progress request button for managers and above */}
                        {hasPermission(project.userRole, 'task.requestProgress') && (
                          <button
                            onClick={() => handleOpenProgressRequest(task)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-md transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            Request Update
                          </button>
                        )}
                      </div>
                    </div>

                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">
                Team Members ({project.memberCount || 0})
              </h3>
              {canManage && (
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Member
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-100">
              {project.members?.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-medium">
                      {member.user?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.user?.name}</p>
                      <p className="text-sm text-gray-500">{member.user?.email}</p>
                    </div>
                  </div>
                  <RoleBadge role={member.role} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

  {/* Progress Request Modal */}
  {progressRequestModal && (
    <ProgressRequestModal
      task={progressRequestModal}
      onClose={handleCloseProgressRequest}
      onRequestProgress={handleRequestProgress}
    />
  )}

  {/* Progress Update Modal */}
  {progressUpdateModal && (
    <ProgressUpdateModal
      task={progressUpdateModal}
      onClose={handleCloseProgressUpdate}
      onUpdateProgress={handleUpdateProgress}
    />
  )}
    </>
  );
}
