#!/usr/bin/env node

/**
 * Migration Script - Migrate existing tasks to collaboration format
 * Implements T055: Create migration script for existing tasks to collaboration format
 *
 * Usage:
 *   node scripts/migrate-to-collaboration.js [--dry-run]
 *
 * Options:
 *   --dry-run  Show what would be migrated without making changes
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Parse command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')

if (isDryRun) {
  console.log('DRY RUN MODE - No changes will be made\n')
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('Starting migration to collaboration format...\n')

  try {
    // Step 1: Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')

    if (usersError) throw usersError
    console.log(`Found ${users.length} users\n`)

    // Step 2: For each user, migrate their tasks
    for (const user of users) {
      await migrateUserTasks(user)
    }

    // Step 3: Verify migration
    await verifyMigration()

    console.log('\nMigration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error.message)
    process.exit(1)
  }
}

/**
 * Migrate tasks for a specific user
 */
async function migrateUserTasks(user) {
  console.log(`\nMigrating tasks for user: ${user.email}`)

  // Get user's tasks that don't have collaboration fields
  const { data: tasks, error: tasksError } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .is('version', null)

  if (tasksError) throw tasksError

  if (!tasks || tasks.length === 0) {
    console.log('  No tasks to migrate')
    return
  }

  console.log(`  Found ${tasks.length} tasks to migrate`)

  // Update tasks with collaboration fields
  for (const task of tasks) {
    const updates = {
      version: 1,
      assigned_to: task.assigned_to || [],
      last_modified_by: user.id
    }

    if (isDryRun) {
      console.log(`  [DRY RUN] Would update task: ${task.title.substring(0, 30)}...`)
    } else {
      const { error: updateError } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', task.id)

      if (updateError) {
        console.error(`  Failed to update task ${task.id}:`, updateError.message)
      } else {
        console.log(`  Updated task: ${task.title.substring(0, 30)}...`)
      }
    }
  }

  // Create a personal shared list for the user if they don't have one
  await createPersonalList(user)
}

/**
 * Create a personal shared list for a user
 */
async function createPersonalList(user) {
  // Check if user already has a personal list
  const { data: existingLists, error: listError } = await supabase
    .from('shared_lists')
    .select('id')
    .eq('owner_id', user.id)
    .eq('name', 'My Tasks')

  if (listError) throw listError

  if (existingLists && existingLists.length > 0) {
    console.log('  Personal list already exists')
    return
  }

  if (isDryRun) {
    console.log('  [DRY RUN] Would create personal shared list')
    return
  }

  // Create personal list
  const { data: newList, error: createError } = await supabase
    .from('shared_lists')
    .insert({
      name: 'My Tasks',
      description: 'Personal task list (auto-created during migration)',
      owner_id: user.id,
      permissions: {},
      max_collaborators: 10
    })
    .select()
    .single()

  if (createError) {
    console.error('  Failed to create personal list:', createError.message)
    return
  }

  // Add user as owner collaborator
  const { error: collabError } = await supabase
    .from('collaborations')
    .insert({
      list_id: newList.id,
      user_id: user.id,
      role: 'admin',
      notifications_enabled: true
    })

  if (collabError) {
    console.error('  Failed to add owner as collaborator:', collabError.message)
  } else {
    console.log('  Created personal shared list')
  }
}

/**
 * Verify the migration was successful
 */
async function verifyMigration() {
  console.log('\nVerifying migration...')

  // Check for tasks without version
  const { count: unmigrated, error: countError } = await supabase
    .from('todos')
    .select('*', { count: 'exact', head: true })
    .is('version', null)

  if (countError) throw countError

  if (unmigrated > 0) {
    console.log(`Warning: ${unmigrated} tasks still without version field`)
  } else {
    console.log('All tasks have been migrated')
  }

  // Check shared lists
  const { count: listCount, error: listCountError } = await supabase
    .from('shared_lists')
    .select('*', { count: 'exact', head: true })

  if (listCountError) throw listCountError
  console.log(`Total shared lists: ${listCount}`)

  // Check collaborations
  const { count: collabCount, error: collabCountError } = await supabase
    .from('collaborations')
    .select('*', { count: 'exact', head: true })

  if (collabCountError) throw collabCountError
  console.log(`Total collaborations: ${collabCount}`)
}

/**
 * Additional utility functions for migration
 */

// Migrate comments to include mentions field
async function migrateComments() {
  console.log('\nMigrating comments...')

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .is('mentions', null)

  if (commentsError) throw commentsError

  if (!comments || comments.length === 0) {
    console.log('  No comments to migrate')
    return
  }

  console.log(`  Found ${comments.length} comments to migrate`)

  for (const comment of comments) {
    // Parse @mentions from content
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match
    while ((match = mentionRegex.exec(comment.content)) !== null) {
      mentions.push(match[1])
    }

    if (isDryRun) {
      console.log(`  [DRY RUN] Would update comment ${comment.id} with mentions: ${mentions.join(', ')}`)
    } else {
      const { error: updateError } = await supabase
        .from('comments')
        .update({
          mentions: [],
          resolved: comment.resolved ?? false
        })
        .eq('id', comment.id)

      if (updateError) {
        console.error(`  Failed to update comment ${comment.id}:`, updateError.message)
      }
    }
  }
}

// Run the migration
console.log('='.repeat(50))
console.log('Todo App - Migration to Collaboration Format')
console.log('='.repeat(50))
console.log('')

migrate()
  .then(() => migrateComments())
  .then(() => {
    console.log('\n' + '='.repeat(50))
    console.log('Migration complete!')
    console.log('='.repeat(50))
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nMigration failed with error:', error)
    process.exit(1)
  })
