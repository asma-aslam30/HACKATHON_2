/**
 * ProjectCard Component
 * Display a project summary card with progress
 */

import { FolderKanban, Users, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../lib/utils';
import ProgressBar from '../shared/ProgressBar';
import RoleBadge from '../shared/RoleBadge';

export default function ProjectCard({ project, onClick }) {
  const completionRate = project.taskCount > 0
    ? Math.round((project.completedTaskCount || 0) / project.taskCount * 100)
    : 0;

  return (
    <div
      onClick={() => onClick?.(project)}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-white font-semibold ${getAvatarColor(project.id)}`}>
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {project.name}
              </h3>
              {project.userRole && (
                <RoleBadge role={project.userRole} size="xs" />
              )}
            </div>
            {project.description && (
              <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{completionRate}%</span>
        </div>
        <ProgressBar percentage={completionRate} size="sm" showLabel={false} />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>{project.completedTaskCount || 0}/{project.taskCount || 0} tasks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>{project.memberCount || 0} members</span>
        </div>
      </div>

      {/* Status Badge */}
      {project.status && project.status !== 'active' && (
        <div className="mt-3">
          <span className={`
            inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full
            ${project.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
            ${project.status === 'archived' ? 'bg-gray-100 text-gray-800' : ''}
          `}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
      )}

      {/* Due Date */}
      {project.endDate && (
        <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Due {new Date(project.endDate).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
}
