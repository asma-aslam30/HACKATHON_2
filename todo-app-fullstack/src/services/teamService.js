/**
 * Team Service
 *
 * Handles CRUD operations for reusable teams and team member management.
 */

import prisma from '../../lib/db.js';
import { isRoleAtLeast, canModifyRole, hasPermission, getAssignableRoles } from '../models/rolePermissions.js';

export class TeamService {
  // ============================================
  // TEAM CRUD OPERATIONS
  // ============================================

  /**
   * Create a new team
   * @param {object} data - Team data
   * @param {string} data.name - Team name
   * @param {string} data.description - Team description
   * @param {string} data.createdBy - User ID of creator
   * @returns {Promise<object>} - Created team with creator as owner
   */
  async createTeam({ name, description, createdBy }) {
    if (!name || !createdBy) {
      throw new Error('Team name and creator are required');
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        createdBy,
        // Automatically add creator as owner
        members: {
          create: {
            userId: createdBy,
            role: 'owner'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        },
        creator: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    return this.transformTeam(team);
  }

  /**
   * Get team by ID
   * @param {string} id - Team ID
   * @param {boolean} includeMembers - Whether to include members
   * @returns {Promise<object|null>} - Team or null
   */
  async getTeamById(id, includeMembers = true) {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: includeMembers ? {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          },
          orderBy: [
            { role: 'desc' }, // Owner first
            { joinedAt: 'asc' }
          ]
        } : false,
        creator: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        projects: {
          include: {
            project: {
              select: { id: true, name: true, status: true }
            }
          }
        }
      }
    });

    return team ? this.transformTeam(team) : null;
  }

  /**
   * Get all teams for a user (teams they are a member of)
   * @param {string} userId - User ID
   * @returns {Promise<object[]>} - Array of teams
   */
  async getTeamsByUserId(userId) {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        },
        creator: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        _count: {
          select: { members: true, projects: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return teams.map(team => this.transformTeam(team));
  }

  /**
   * Update team details
   * @param {string} id - Team ID
   * @param {object} updates - Fields to update
   * @param {string} requestingUserId - User making the request
   * @returns {Promise<object>} - Updated team
   */
  async updateTeam(id, updates, requestingUserId) {
    // Check permission
    const userRole = await this.getUserRole(id, requestingUserId);
    if (!hasPermission(userRole, 'team.edit')) {
      throw new Error('You do not have permission to edit this team');
    }

    const { name, description, avatarUrl } = updates;
    const team = await prisma.team.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(avatarUrl !== undefined && { avatarUrl })
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        },
        creator: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    return this.transformTeam(team);
  }

  /**
   * Delete a team (owner only)
   * @param {string} id - Team ID
   * @param {string} requestingUserId - User making the request
   * @returns {Promise<boolean>} - Success
   */
  async deleteTeam(id, requestingUserId) {
    const userRole = await this.getUserRole(id, requestingUserId);
    if (!hasPermission(userRole, 'team.delete')) {
      throw new Error('Only the team owner can delete the team');
    }

    await prisma.team.delete({ where: { id } });
    return true;
  }

  // ============================================
  // MEMBER MANAGEMENT
  // ============================================

  /**
   * Add a member to the team
   * @param {string} teamId - Team ID
   * @param {string} userId - User to add
   * @param {string} role - Role to assign
   * @param {string} invitedBy - User making the request
   * @returns {Promise<object>} - Created membership
   */
  async addMember(teamId, userId, role = 'member', invitedBy) {
    // Check permission
    const inviterRole = await this.getUserRole(teamId, invitedBy);
    if (!hasPermission(inviterRole, 'member.add')) {
      throw new Error('You do not have permission to add members');
    }

    // Check if role is assignable
    const assignableRoles = getAssignableRoles(inviterRole);
    if (!assignableRoles.includes(role)) {
      throw new Error(`You cannot assign the role: ${role}`);
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } }
    });
    if (existingMember) {
      throw new Error('User is already a team member');
    }

    const membership = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role,
        invitedBy
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    return this.transformMember(membership);
  }

  /**
   * Remove a member from the team
   * @param {string} teamId - Team ID
   * @param {string} userId - User to remove
   * @param {string} requestingUserId - User making the request
   * @returns {Promise<boolean>} - Success
   */
  async removeMember(teamId, userId, requestingUserId) {
    const requestingUserRole = await this.getUserRole(teamId, requestingUserId);
    const targetUserRole = await this.getUserRole(teamId, userId);

    // Users can remove themselves
    if (userId === requestingUserId) {
      if (targetUserRole === 'owner') {
        throw new Error('Owners cannot leave the team. Transfer ownership first.');
      }
    } else {
      // Check permission to remove others
      if (!hasPermission(requestingUserRole, 'member.remove')) {
        throw new Error('You do not have permission to remove members');
      }
      if (!canModifyRole(requestingUserRole, targetUserRole)) {
        throw new Error('You cannot remove a member with equal or higher role');
      }
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId } }
    });

    return true;
  }

  /**
   * Update a member's role
   * @param {string} teamId - Team ID
   * @param {string} userId - User to update
   * @param {string} newRole - New role
   * @param {string} requestingUserId - User making the request
   * @returns {Promise<object>} - Updated membership
   */
  async updateMemberRole(teamId, userId, newRole, requestingUserId) {
    const requestingUserRole = await this.getUserRole(teamId, requestingUserId);
    const targetUserRole = await this.getUserRole(teamId, userId);

    // Check permission
    if (!hasPermission(requestingUserRole, 'member.updateRole')) {
      throw new Error('You do not have permission to update roles');
    }

    // Check if can modify target's role
    if (!canModifyRole(requestingUserRole, targetUserRole)) {
      throw new Error('You cannot modify this member\'s role');
    }

    // Check if new role is assignable
    const assignableRoles = getAssignableRoles(requestingUserRole);
    if (!assignableRoles.includes(newRole)) {
      throw new Error(`You cannot assign the role: ${newRole}`);
    }

    const membership = await prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId } },
      data: { role: newRole },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    return this.transformMember(membership);
  }

  /**
   * Get all members of a team
   * @param {string} teamId - Team ID
   * @returns {Promise<object[]>} - Array of members
   */
  async getMembersByTeamId(teamId) {
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: [
        { role: 'desc' },
        { joinedAt: 'asc' }
      ]
    });

    return members.map(m => this.transformMember(m));
  }

  /**
   * Transfer team ownership
   * @param {string} teamId - Team ID
   * @param {string} newOwnerId - New owner user ID
   * @param {string} currentOwnerId - Current owner user ID
   * @returns {Promise<boolean>} - Success
   */
  async transferOwnership(teamId, newOwnerId, currentOwnerId) {
    const currentRole = await this.getUserRole(teamId, currentOwnerId);
    if (currentRole !== 'owner') {
      throw new Error('Only the owner can transfer ownership');
    }

    // Check new owner is a member
    const newOwnerMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: newOwnerId } }
    });
    if (!newOwnerMembership) {
      throw new Error('New owner must be a team member');
    }

    // Transaction: Update both roles
    await prisma.$transaction([
      prisma.teamMember.update({
        where: { teamId_userId: { teamId, userId: currentOwnerId } },
        data: { role: 'admin' }
      }),
      prisma.teamMember.update({
        where: { teamId_userId: { teamId, userId: newOwnerId } },
        data: { role: 'owner' }
      })
    ]);

    return true;
  }

  // ============================================
  // PERMISSION HELPERS
  // ============================================

  /**
   * Get user's role in a team
   * @param {string} teamId - Team ID
   * @param {string} userId - User ID
   * @returns {Promise<string|null>} - Role or null
   */
  async getUserRole(teamId, userId) {
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } }
    });
    return membership?.role || null;
  }

  /**
   * Check if user has permission in team
   * @param {string} teamId - Team ID
   * @param {string} userId - User ID
   * @param {string} permission - Permission to check
   * @returns {Promise<boolean>} - Has permission
   */
  async checkPermission(teamId, userId, permission) {
    const role = await this.getUserRole(teamId, userId);
    return hasPermission(role, permission);
  }

  /**
   * Check if user has access to team
   * @param {string} teamId - Team ID
   * @param {string} userId - User ID
   * @returns {Promise<{hasAccess: boolean, role: string|null}>}
   */
  async checkAccess(teamId, userId) {
    const role = await this.getUserRole(teamId, userId);
    return { hasAccess: role !== null, role };
  }

  // ============================================
  // TRANSFORM HELPERS
  // ============================================

  transformTeam(team) {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      avatarUrl: team.avatarUrl,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      createdBy: team.createdBy,
      creator: team.creator,
      members: team.members?.map(m => this.transformMember(m)) || [],
      projects: team.projects?.map(pt => ({
        id: pt.project.id,
        name: pt.project.name,
        status: pt.project.status,
        role: pt.role
      })) || [],
      memberCount: team._count?.members || team.members?.length || 0,
      projectCount: team._count?.projects || team.projects?.length || 0
    };
  }

  transformMember(membership) {
    return {
      id: membership.id,
      teamId: membership.teamId,
      userId: membership.userId,
      role: membership.role,
      joinedAt: membership.joinedAt,
      invitedBy: membership.invitedBy,
      user: membership.user
    };
  }
}

// Export singleton instance
const teamService = new TeamService();
export default teamService;
