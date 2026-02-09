/**
 * Project Service
 *
 * Handles CRUD operations for projects, member management, team assignment,
 * and role resolution (combining direct and team-based roles).
 */

import prisma from '../../lib/db.js';
import {
  isRoleAtLeast,
  canModifyRole,
  hasPermission,
  getAssignableRoles,
  getHigherRole
} from '../models/rolePermissions.js';

export class ProjectService {
  // ============================================
  // PROJECT CRUD OPERATIONS
  // ============================================

  /**
   * Create a new project
   * @param {object} data - Project data
   * @returns {Promise<object>} - Created project with owner as member
   */
  async createProject({ name, description, ownerId, startDate, endDate }) {
    if (!name || !ownerId) {
      throw new Error('Project name and owner are required');
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        // Automatically add owner as member with owner role
        members: {
          create: {
            userId: ownerId,
            role: 'owner'
          }
        }
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        },
        teams: {
          include: {
            team: {
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: { todos: true, members: true, teams: true }
        }
      }
    });

    return this.transformProject(project);
  }

  /**
   * Get project by ID
   * @param {string} id - Project ID
   * @param {string} userId - Requesting user ID (for role resolution)
   * @returns {Promise<object|null>} - Project with user's role
   */
  async getProjectById(id, userId) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          },
          orderBy: { joinedAt: 'asc' }
        },
        teams: {
          include: {
            team: {
              include: {
                members: {
                  select: { userId: true, role: true }
                }
              }
            }
          }
        },
        _count: {
          select: { todos: true, members: true, teams: true }
        }
      }
    });

    if (!project) return null;

    const userRole = await this.resolveUserRole(id, userId);
    return {
      ...this.transformProject(project),
      userRole
    };
  }

  /**
   * Get all projects accessible by a user
   * @param {string} userId - User ID
   * @returns {Promise<object[]>} - Array of projects with user's role
   */
  async getProjectsByUserId(userId) {
    // Get projects where user is direct member
    const directProjects = await prisma.project.findMany({
      where: {
        members: { some: { userId } }
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        _count: {
          select: { todos: true, members: true, teams: true }
        }
      }
    });

    // Get projects where user is in an assigned team
    const teamProjects = await prisma.project.findMany({
      where: {
        teams: {
          some: {
            team: {
              members: { some: { userId } }
            }
          }
        },
        NOT: {
          members: { some: { userId } }
        }
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        _count: {
          select: { todos: true, members: true, teams: true }
        }
      }
    });

    const allProjects = [...directProjects, ...teamProjects];

    // Add user's role to each project
    const projectsWithRoles = await Promise.all(
      allProjects.map(async (project) => {
        const userRole = await this.resolveUserRole(project.id, userId);
        return {
          ...this.transformProject(project),
          userRole
        };
      })
    );

    return projectsWithRoles.sort((a, b) =>
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  }

  /**
   * Update project details
   * @param {string} id - Project ID
   * @param {object} updates - Fields to update
   * @param {string} requestingUserId - User making the request
   * @returns {Promise<object>} - Updated project
   */
  async updateProject(id, updates, requestingUserId) {
    const userRole = await this.resolveUserRole(id, requestingUserId);
    if (!hasPermission(userRole, 'project.edit')) {
      throw new Error('You do not have permission to edit this project');
    }

    const { name, description, status, startDate, endDate, settings } = updates;
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(settings !== undefined && { settings })
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        },
        _count: {
          select: { todos: true, members: true, teams: true }
        }
      }
    });

    return this.transformProject(project);
  }

  /**
   * Delete a project (owner only)
   * @param {string} id - Project ID
   * @param {string} requestingUserId - User making the request
   * @returns {Promise<boolean>} - Success
   */
  async deleteProject(id, requestingUserId) {
    const userRole = await this.resolveUserRole(id, requestingUserId);
    if (!hasPermission(userRole, 'project.delete')) {
      throw new Error('Only the project owner can delete the project');
    }

    await prisma.project.delete({ where: { id } });
    return true;
  }

  /**
   * Archive a project
   * @param {string} id - Project ID
   * @param {string} requestingUserId - User making the request
   * @returns {Promise<object>} - Archived project
   */
  async archiveProject(id, requestingUserId) {
    const userRole = await this.resolveUserRole(id, requestingUserId);
    if (!hasPermission(userRole, 'project.archive')) {
      throw new Error('You do not have permission to archive this project');
    }

    const project = await prisma.project.update({
      where: { id },
      data: { status: 'archived' },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        _count: {
          select: { todos: true, members: true, teams: true }
        }
      }
    });

    return this.transformProject(project);
  }

  // ============================================
  // MEMBER MANAGEMENT
  // ============================================

  /**
   * Add a member to the project
   * @param {string} projectId - Project ID
   * @param {string} userId - User to add
   * @param {string} role - Role to assign
   * @param {string} invitedBy - User making the request
   * @returns {Promise<object>} - Created membership
   */
  async addMember(projectId, userId, role = 'member', invitedBy) {
    const inviterRole = await this.resolveUserRole(projectId, invitedBy);
    if (!hasPermission(inviterRole, 'member.add')) {
      throw new Error('You do not have permission to add members');
    }

    const assignableRoles = getAssignableRoles(inviterRole);
    if (!assignableRoles.includes(role)) {
      throw new Error(`You cannot assign the role: ${role}`);
    }

    // Check if user is already a direct member
    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (existingMember) {
      throw new Error('User is already a project member');
    }

    const membership = await prisma.projectMember.create({
      data: {
        projectId,
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
   * Remove a member from the project
   * @param {string} projectId - Project ID
   * @param {string} userId - User to remove
   * @param {string} requestingUserId - User making the request
   * @returns {Promise<boolean>} - Success
   */
  async removeMember(projectId, userId, requestingUserId) {
    const requestingUserRole = await this.resolveUserRole(projectId, requestingUserId);
    const targetUserRole = await this.resolveUserRole(projectId, userId);

    // Users can remove themselves (except owners)
    if (userId === requestingUserId) {
      if (targetUserRole === 'owner') {
        throw new Error('Owners cannot leave the project. Transfer ownership first.');
      }
    } else {
      if (!hasPermission(requestingUserRole, 'member.remove')) {
        throw new Error('You do not have permission to remove members');
      }
      if (!canModifyRole(requestingUserRole, targetUserRole)) {
        throw new Error('You cannot remove a member with equal or higher role');
      }
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } }
    });

    return true;
  }

  /**
   * Update a member's role
   * @param {string} projectId - Project ID
   * @param {string} userId - User to update
   * @param {string} newRole - New role
   * @param {string} requestingUserId - User making the request
   * @returns {Promise<object>} - Updated membership
   */
  async updateMemberRole(projectId, userId, newRole, requestingUserId) {
    const requestingUserRole = await this.resolveUserRole(projectId, requestingUserId);

    // Get target's direct membership
    const targetMembership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });

    if (!targetMembership) {
      throw new Error('User is not a direct project member');
    }

    if (!hasPermission(requestingUserRole, 'member.updateRole')) {
      throw new Error('You do not have permission to update roles');
    }

    if (!canModifyRole(requestingUserRole, targetMembership.role)) {
      throw new Error('You cannot modify this member\'s role');
    }

    const assignableRoles = getAssignableRoles(requestingUserRole);
    if (!assignableRoles.includes(newRole)) {
      throw new Error(`You cannot assign the role: ${newRole}`);
    }

    const membership = await prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
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
   * Get all members of a project (direct + team-based)
   * @param {string} projectId - Project ID
   * @returns {Promise<object[]>} - Array of members with resolved roles
   */
  async getProjectMembers(projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        },
        teams: {
          include: {
            team: {
              include: {
                members: {
                  include: {
                    user: {
                      select: { id: true, name: true, email: true, avatarUrl: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!project) return [];

    // Build combined member list with resolved roles
    const memberMap = new Map();

    // Add direct members
    for (const member of project.members) {
      memberMap.set(member.userId, {
        ...this.transformMember(member),
        source: 'direct',
        resolvedRole: member.role
      });
    }

    // Add team members (resolve role conflicts)
    for (const projectTeam of project.teams) {
      const teamRole = projectTeam.role; // Default role for this team in project
      for (const teamMember of projectTeam.team.members) {
        const userId = teamMember.userId;
        const existing = memberMap.get(userId);

        if (existing) {
          // User already in list, take higher role
          existing.resolvedRole = getHigherRole(existing.resolvedRole, teamRole);
          existing.teams = existing.teams || [];
          existing.teams.push({
            id: projectTeam.team.id,
            name: projectTeam.team.name,
            role: teamRole
          });
        } else {
          memberMap.set(userId, {
            id: `team-${projectTeam.teamId}-${userId}`,
            projectId,
            userId,
            role: teamRole,
            source: 'team',
            resolvedRole: teamRole,
            user: teamMember.user,
            teams: [{
              id: projectTeam.team.id,
              name: projectTeam.team.name,
              role: teamRole
            }]
          });
        }
      }
    }

    return Array.from(memberMap.values()).sort((a, b) => {
      // Sort by role (owner first), then by name
      const roleOrder = { owner: 0, admin: 1, manager: 2, member: 3, viewer: 4 };
      if (roleOrder[a.resolvedRole] !== roleOrder[b.resolvedRole]) {
        return roleOrder[a.resolvedRole] - roleOrder[b.resolvedRole];
      }
      return (a.user?.name || '').localeCompare(b.user?.name || '');
    });
  }

  /**
   * Transfer project ownership
   * @param {string} projectId - Project ID
   * @param {string} newOwnerId - New owner user ID
   * @param {string} currentOwnerId - Current owner user ID
   * @returns {Promise<boolean>} - Success
   */
  async transferOwnership(projectId, newOwnerId, currentOwnerId) {
    const currentRole = await this.resolveUserRole(projectId, currentOwnerId);
    if (currentRole !== 'owner') {
      throw new Error('Only the owner can transfer ownership');
    }

    // Ensure new owner is a member
    let newOwnerMembership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: newOwnerId } }
    });

    await prisma.$transaction(async (tx) => {
      // Demote current owner to admin
      await tx.projectMember.update({
        where: { projectId_userId: { projectId, userId: currentOwnerId } },
        data: { role: 'admin' }
      });

      // Promote or create new owner
      if (newOwnerMembership) {
        await tx.projectMember.update({
          where: { projectId_userId: { projectId, userId: newOwnerId } },
          data: { role: 'owner' }
        });
      } else {
        await tx.projectMember.create({
          data: {
            projectId,
            userId: newOwnerId,
            role: 'owner'
          }
        });
      }

      // Update project owner
      await tx.project.update({
        where: { id: projectId },
        data: { ownerId: newOwnerId }
      });
    });

    return true;
  }

  // ============================================
  // TEAM ASSIGNMENT
  // ============================================

  /**
   * Add a team to the project
   * @param {string} projectId - Project ID
   * @param {string} teamId - Team ID
   * @param {string} defaultRole - Default role for team members
   * @param {string} addedBy - User making the request
   * @returns {Promise<object>} - Created project-team relation
   */
  async addTeam(projectId, teamId, defaultRole = 'member', addedBy) {
    const userRole = await this.resolveUserRole(projectId, addedBy);
    if (!hasPermission(userRole, 'project.addTeam')) {
      throw new Error('You do not have permission to add teams');
    }

    // Check if team is already added
    const existing = await prisma.projectTeam.findUnique({
      where: { projectId_teamId: { projectId, teamId } }
    });
    if (existing) {
      throw new Error('Team is already assigned to this project');
    }

    const projectTeam = await prisma.projectTeam.create({
      data: {
        projectId,
        teamId,
        role: defaultRole,
        addedBy
      },
      include: {
        team: {
          select: { id: true, name: true, description: true }
        }
      }
    });

    return {
      id: projectTeam.id,
      projectId: projectTeam.projectId,
      teamId: projectTeam.teamId,
      role: projectTeam.role,
      addedAt: projectTeam.addedAt,
      team: projectTeam.team
    };
  }

  /**
   * Remove a team from the project
   * @param {string} projectId - Project ID
   * @param {string} teamId - Team ID
   * @param {string} requestingUserId - User making the request
   * @returns {Promise<boolean>} - Success
   */
  async removeTeam(projectId, teamId, requestingUserId) {
    const userRole = await this.resolveUserRole(projectId, requestingUserId);
    if (!hasPermission(userRole, 'project.removeTeam')) {
      throw new Error('You do not have permission to remove teams');
    }

    await prisma.projectTeam.delete({
      where: { projectId_teamId: { projectId, teamId } }
    });

    return true;
  }

  /**
   * Get all teams assigned to a project
   * @param {string} projectId - Project ID
   * @returns {Promise<object[]>} - Array of teams
   */
  async getProjectTeams(projectId) {
    const projectTeams = await prisma.projectTeam.findMany({
      where: { projectId },
      include: {
        team: {
          include: {
            _count: { select: { members: true } }
          }
        }
      }
    });

    return projectTeams.map(pt => ({
      id: pt.id,
      projectId: pt.projectId,
      teamId: pt.teamId,
      role: pt.role,
      addedAt: pt.addedAt,
      team: {
        id: pt.team.id,
        name: pt.team.name,
        description: pt.team.description,
        memberCount: pt.team._count.members
      }
    }));
  }

  // ============================================
  // TASK OPERATIONS
  // ============================================

  /**
   * Get all tasks in a project
   * @param {string} projectId - Project ID
   * @param {object} filters - Optional filters
   * @returns {Promise<object[]>} - Array of tasks
   */
  async getProjectTasks(projectId, filters = {}) {
    const { status, priority, assignedTo, search } = filters;

    const tasks = await prisma.todo.findMany({
      where: {
        projectId,
        ...(status === 'completed' && { completed: true }),
        ...(status === 'pending' && { completed: false }),
        ...(priority && { priority }),
        ...(assignedTo && { assignedTo: { has: assignedTo } }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        comments: {
          select: { id: true }
        },
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        }
      },
      orderBy: [
        { completed: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority,
      dueDate: task.dueDate,
      progress: task.progress,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      creator: task.user,
      assignedTo: task.assignedTo,
      assignments: task.assignments,
      commentCount: task.comments.length
    }));
  }

  /**
   * Get project progress statistics
   * @param {string} projectId - Project ID
   * @returns {Promise<object>} - Progress stats
   */
  async getProjectProgress(projectId) {
    const tasks = await prisma.todo.findMany({
      where: { projectId },
      select: {
        id: true,
        completed: true,
        progress: true,
        priority: true,
        assignedTo: true
      }
    });

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const avgProgress = total > 0
      ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total)
      : 0;

    // By priority
    const byPriority = {
      high: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      low: { total: 0, completed: 0 }
    };

    tasks.forEach(task => {
      if (byPriority[task.priority]) {
        byPriority[task.priority].total++;
        if (task.completed) byPriority[task.priority].completed++;
      }
    });

    return {
      total,
      completed,
      pending: total - completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgProgress,
      byPriority
    };
  }

  // ============================================
  // ROLE RESOLUTION (Complex - combines direct + team roles)
  // ============================================

  /**
   * Resolve a user's effective role in a project
   * Considers both direct membership and team-based membership
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @returns {Promise<string|null>} - Resolved role or null
   */
  async resolveUserRole(projectId, userId) {
    // Check if user is project owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true }
    });

    if (project?.ownerId === userId) {
      return 'owner';
    }

    // Check direct membership
    const directMembership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });

    let highestRole = directMembership?.role || null;

    // Check team-based membership
    const teamMemberships = await prisma.projectTeam.findMany({
      where: {
        projectId,
        team: {
          members: { some: { userId } }
        }
      },
      select: { role: true }
    });

    // Get highest role from all sources
    for (const teamMembership of teamMemberships) {
      highestRole = getHigherRole(highestRole, teamMembership.role);
    }

    return highestRole;
  }

  /**
   * Check if user has permission in project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @param {string} permission - Permission to check
   * @returns {Promise<boolean>} - Has permission
   */
  async checkPermission(projectId, userId, permission) {
    const role = await this.resolveUserRole(projectId, userId);
    return hasPermission(role, permission);
  }

  /**
   * Check if user has access to project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @returns {Promise<{hasAccess: boolean, role: string|null}>}
   */
  async checkAccess(projectId, userId) {
    const role = await this.resolveUserRole(projectId, userId);
    return { hasAccess: role !== null, role };
  }

  // ============================================
  // TRANSFORM HELPERS
  // ============================================

  transformProject(project) {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      settings: project.settings,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      ownerId: project.ownerId,
      owner: project.owner,
      members: project.members?.map(m => this.transformMember(m)) || [],
      teams: project.teams?.map(pt => ({
        id: pt.id,
        teamId: pt.teamId,
        role: pt.role,
        team: pt.team
      })) || [],
      taskCount: project._count?.todos || 0,
      memberCount: project._count?.members || 0,
      teamCount: project._count?.teams || 0
    };
  }

  transformMember(membership) {
    return {
      id: membership.id,
      projectId: membership.projectId,
      userId: membership.userId,
      role: membership.role,
      joinedAt: membership.joinedAt,
      invitedBy: membership.invitedBy,
      notificationsEnabled: membership.notificationsEnabled,
      user: membership.user
    };
  }
}

// Export singleton instance
const projectService = new ProjectService();
export default projectService;
