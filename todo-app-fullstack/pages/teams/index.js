/**
 * Teams List Page
 * Display all teams the user belongs to
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Plus, Users, Search } from 'lucide-react';
import { useStore } from '../../lib/store';
import TeamCard from '../../components/teams/TeamCard';
import TeamForm from '../../components/teams/TeamForm';

export default function TeamsPage() {
  const router = useRouter();
  const { teams, setTeams, addTeam, loading, setLoading } = useStore();
  const user = useStore(state => state.user);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch teams on mount
  useEffect(() => {
    if (user?.id) {
      fetchTeams();
    }
  }, [user?.id]);

  const fetchTeams = async () => {
    if (!user?.id) return;

    setLoading('teams', true);
    try {
      const res = await fetch('/api/teams', {
        headers: { 'x-user-id': user.id }
      });

      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading('teams', false);
    }
  };

  const handleCreateTeam = async (data) => {
    if (!user?.id) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create team');
      }

      const { team } = await res.json();
      addTeam(team);
      setShowCreateModal(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTeamClick = (team) => {
    router.push(`/teams/${team.id}`);
  };

  // Filter teams by search query
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Please log in to view teams</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-600 mt-1">Manage your teams and collaborate with others</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Team
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Teams Grid */}
        {loading.teams ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No teams found</h3>
                <p className="text-gray-500">Try a different search term</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No teams yet</h3>
                <p className="text-gray-500 mb-4">Create your first team to start collaborating</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Team
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={handleTeamClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <TeamForm
          onSubmit={handleCreateTeam}
          onClose={() => setShowCreateModal(false)}
          isLoading={isCreating}
        />
      )}
    </div>
  );
}
