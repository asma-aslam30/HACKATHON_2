/**
 * TeamCard Component
 * Display a team summary card
 */

import { Users, FolderKanban, ChevronRight } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../lib/utils';

export default function TeamCard({ team, onClick }) {
  return (
    <div
      onClick={() => onClick?.(team)}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {team.avatarUrl ? (
            <img
              src={team.avatarUrl}
              alt={team.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold ${getAvatarColor(team.id)}`}>
              {getInitials(team.name)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {team.name}
            </h3>
            {team.description && (
              <p className="text-sm text-gray-500 line-clamp-1">{team.description}</p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>{team.memberCount || team.members?.length || 0} members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FolderKanban className="w-4 h-4" />
          <span>{team.projectCount || team.projects?.length || 0} projects</span>
        </div>
      </div>

      {/* Member Avatars */}
      {team.members && team.members.length > 0 && (
        <div className="mt-3 flex -space-x-2">
          {team.members.slice(0, 5).map((member) => (
            <div
              key={member.id}
              className="w-7 h-7 rounded-full border-2 border-white overflow-hidden"
              title={member.user?.name}
            >
              {member.user?.avatarUrl ? (
                <img
                  src={member.user.avatarUrl}
                  alt={member.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(member.userId)}`}>
                  {getInitials(member.user?.name)}
                </div>
              )}
            </div>
          ))}
          {team.members.length > 5 && (
            <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              +{team.members.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
