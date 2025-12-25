# Animations & Gamification Skill

**Purpose**: Create delightful micro-interactions with Tailwind CSS, Framer Motion animations, and gamification UX elements for Evolution of Todo hackathon phases II-III

**Owner**: Frontend UI/UX Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Animations & Gamification Skill** enables creation of engaging, performant animations and motivational gamification elements:
- Design micro-interactions for task completion, status changes, and user actions
- Create smooth page transitions with Framer Motion
- Implement gamification elements (streaks, XP, badges, levels)
- Optimize animations for performance (60fps, reduced motion support)
- Ensure accessibility (prefers-reduced-motion media query)
- Generate animation specifications for implementation

This skill adds polish and user engagement through purposeful motion design and game mechanics.

---

## Skill Components

### 1. Micro-Interactions per Phase

**Phase II (Web App)**:
- **Task Complete**: Checkmark animation + confetti burst + green glow
- **Task Delete**: Fade out + scale down + slide left
- **Task Create**: Slide in from bottom + bounce effect
- **Filter Change**: Smooth fade in/out of tasks
- **Status Change**: Color transition + icon morph
- **Priority Badge**: Pulse animation for high priority
- **Loading States**: Skeleton loaders with shimmer effect

**Phase III (AI Chatbot)**:
- **Typing Indicator**: Animated dots pulse (3 dots wave)
- **Tool Call Execution**: Spinner → Progress bar → Success checkmark
- **Message Sent**: Slide up + fade in
- **Message Received**: Slide down + fade in
- **Tool Result**: Cascade reveal (top to bottom)
- **Error State**: Shake animation + red flash

### 2. Gamification Elements

**Streak Counter**:
- Daily login tracking
- Fire emoji animation when streak increases
- Milestone celebrations (7 days, 30 days, 100 days)
- Streak loss warning animation

**XP & Levels**:
- Points earned for completing tasks
- Progress bar animation on XP gain
- Level-up celebration (confetti + sound effect)
- XP badges (Bronze, Silver, Gold, Platinum)

**Daily Goals**:
- Circular progress ring animation
- Goal completion celebration
- Multiple goal types (tasks completed, high priority tasks, consecutive days)

**Achievement Badges**:
- Badge unlock animation (flip reveal)
- Badge collection grid
- Rarity tiers (Common, Rare, Epic, Legendary)
- Animated badge icons

**Priority Completion Streaks**:
- High priority completion counter
- Visual feedback on consecutive completions
- Bonus XP multiplier animation

### 3. Animation Techniques

**Tailwind CSS Animations**:
- Built-in utilities (`animate-spin`, `animate-pulse`, `animate-bounce`)
- Custom animations in `tailwind.config.js`
- Transition utilities (`transition-all`, `duration-300`, `ease-in-out`)

**Framer Motion**:
- Declarative animations with `<motion.div>`
- Variants for complex sequences
- Exit animations
- Stagger children animations
- Gesture animations (drag, hover, tap)
- Scroll-triggered animations

**Performance Optimizations**:
- Use `transform` and `opacity` (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left` (layout thrashing)
- Use `will-change` sparingly
- Reduce motion for accessibility (`prefers-reduced-motion`)

### 4. Accessibility Considerations

**Reduced Motion Support**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Focus Indicators**:
- Animate focus rings smoothly
- Don't remove focus indicators for keyboard users

**Screen Reader Announcements**:
- Announce state changes (task completed, XP gained)
- Use `aria-live="polite"` for non-critical updates

---

## Skill Instructions

### Step 1: Define Animation Purpose

Every animation should serve a purpose.

**Animation Purposes**:
- **Feedback**: Confirm user action (button click, task complete)
- **Status**: Show system state (loading, processing, success, error)
- **Attention**: Draw focus to important elements (new notification, urgent task)
- **Delight**: Add personality and joy (confetti, celebrations)
- **Transition**: Smooth page/state changes (route transitions, modal open/close)

**Template**:
```markdown
## [Animation Name]

**Purpose**: [Feedback | Status | Attention | Delight | Transition]
**Trigger**: [User action or system event]
**Duration**: [100-500ms for feedback, 300-800ms for transitions]
**Easing**: [ease-in-out | ease-out | spring]

### Description
[1-2 sentence description of animation behavior]

### Technical Approach
- [ ] Tailwind CSS utilities
- [ ] Framer Motion
- [ ] Custom keyframes

### Performance
- GPU accelerated: [Yes/No]
- Reduced motion fallback: [Yes/No]
```

---

### Step 2: Design Micro-Interactions

Create detailed specifications for each micro-interaction.

---

#### Example: Task Complete Animation

```markdown
## Task Complete Animation

**Purpose**: Feedback + Delight
**Trigger**: User clicks "Complete" button or checkbox
**Duration**: 600ms total (checkmark 300ms + confetti 300ms)
**Easing**: spring (bounce effect)

### Description
When a task is marked complete, a checkmark animates in with a bounce effect, followed by a brief confetti burst. The task card gets a subtle green glow that fades after 2 seconds.

### Animation Sequence
1. **Checkmark appears** (0-300ms):
   - Scale from 0 to 1.2 to 1 (bounce)
   - Rotate from -45° to 0°
   - Color: Green (#10b981)

2. **Confetti burst** (300-600ms):
   - 20-30 small colored dots
   - Explode from checkmark position
   - Random directions (360° spread)
   - Fade out as they fall

3. **Green glow** (0-2000ms):
   - Box-shadow: 0 0 20px rgba(16, 185, 129, 0.3)
   - Fade in 300ms, hold 1400ms, fade out 300ms

4. **Status update** (concurrent):
   - Text color: gray-900 → gray-400 (line-through)
   - Background opacity: 100% → 60%

### Tailwind Implementation
```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  id: number;
  title: string;
  status: 'pending' | 'completed';
  onComplete: (id: number) => void;
}

export function TaskCard({ id, title, status, onComplete }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = () => {
    setIsCompleting(true);

    // Confetti burst
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
    });

    // Call API after animation
    setTimeout(() => {
      onComplete(id);
      setIsCompleting(false);
    }, 600);
  };

  return (
    <motion.article
      className={`
        relative p-4 rounded-xl border
        transition-all duration-300
        ${status === 'completed'
          ? 'bg-gray-50 dark:bg-gray-900 opacity-60'
          : 'bg-white dark:bg-gray-800'
        }
        ${isCompleting ? 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'shadow-md'}
      `}
      animate={isCompleting ? {
        boxShadow: [
          '0 4px 6px rgba(0,0,0,0.1)',
          '0 0 20px rgba(16,185,129,0.3)',
          '0 4px 6px rgba(0,0,0,0.1)',
        ]
      } : {}}
      transition={{ duration: 2 }}
    >
      {/* Checkmark Animation */}
      {isCompleting && (
        <motion.div
          className="absolute top-2 right-2 text-green-500 text-4xl"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: [0, 1.2, 1], rotate: 0 }}
          transition={{
            duration: 0.3,
            times: [0, 0.6, 1],
            type: 'spring',
            stiffness: 200,
          }}
        >
          ✓
        </motion.div>
      )}

      <h3
        className={`
          text-lg font-semibold
          transition-all duration-300
          ${status === 'completed'
            ? 'text-gray-400 line-through'
            : 'text-gray-900 dark:text-gray-100'
          }
        `}
      >
        {title}
      </h3>

      <button
        onClick={handleComplete}
        disabled={status === 'completed' || isCompleting}
        className="
          mt-2 px-3 py-1 rounded
          bg-green-500 hover:bg-green-600
          text-white text-sm
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        "
      >
        {status === 'completed' ? '✓ Completed' : 'Complete'}
      </button>
    </motion.article>
  );
}
```
```

### Reduced Motion Fallback
```tsx
// Check user preference
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Conditional animation
<motion.div
  animate={prefersReducedMotion ? {} : {
    scale: [0, 1.2, 1],
    rotate: [-45, 0],
  }}
  transition={{
    duration: prefersReducedMotion ? 0 : 0.3,
  }}
>
  ✓
</motion.div>
```

### Performance Notes
- Uses `transform` (scale, rotate) - GPU accelerated ✅
- Avoids layout properties ✅
- Confetti library is ~2KB gzipped ✅
- Total animation < 1 second ✅
```

---

#### Example: Typing Indicator (Phase III)

```markdown
## Typing Indicator Animation

**Purpose**: Status (AI is generating response)
**Trigger**: AI starts processing user message
**Duration**: Infinite loop until message received
**Easing**: ease-in-out

### Description
Three dots pulse in sequence (wave effect) to indicate the AI is "thinking" and generating a response.

### Animation Sequence
1. **Dot 1**: Scale 0.8 → 1.2 → 0.8 (600ms loop, 0ms delay)
2. **Dot 2**: Scale 0.8 → 1.2 → 0.8 (600ms loop, 150ms delay)
3. **Dot 3**: Scale 0.8 → 1.2 → 0.8 (600ms loop, 300ms delay)

### Tailwind + Framer Motion Implementation
```tsx
'use client';

import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div
      className="
        flex gap-1 items-center
        bg-gray-200 dark:bg-gray-700
        rounded-2xl rounded-bl-sm
        px-4 py-3
        max-w-[80px]
      "
      aria-label="AI is typing"
      role="status"
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
```

### Alternative: Tailwind-Only (No Framer Motion)
```tsx
export function TypingIndicatorSimple() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
      <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:300ms]" />
    </div>
  );
}
```

### Accessibility
```tsx
<div
  aria-label="AI is typing"
  aria-live="polite"
  role="status"
>
  {/* Animation */}
</div>
```
```

---

#### Example: Tool Call Animation (Phase III)

```markdown
## Tool Call Animation

**Purpose**: Status (MCP tool execution in progress)
**Trigger**: AI invokes MCP tool (add_task, list_tasks, etc.)
**Duration**: Until tool returns result
**Easing**: linear (spinner), spring (success)

### Description
When the AI invokes an MCP tool, show a loading spinner with tool name, then transition to success checkmark or error icon based on result.

### Animation Sequence

**Phase 1: Loading** (0-Nms, until tool returns):
1. Skeleton loader appears (pulse effect)
2. Tool name displays with spinner icon
3. Status text: "Executing tool..."

**Phase 2: Success** (0-500ms):
1. Spinner stops
2. Checkmark cascades in (top → bottom slide)
3. Background: gray → green (300ms transition)
4. Status text: "✓ Task created successfully"

**Phase 3: Error** (if tool fails):
1. Spinner stops
2. X icon shakes (3 times)
3. Background: gray → red (300ms transition)
4. Status text: "✗ Failed to create task"

### Implementation
```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X } from 'lucide-react';

interface ToolCallDisplayProps {
  toolName: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export function ToolCallDisplay({
  toolName,
  status,
  message,
}: ToolCallDisplayProps) {
  return (
    <motion.div
      className={`
        border-l-4 rounded-lg p-3 my-2
        transition-colors duration-300
        ${status === 'pending' && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'}
        ${status === 'success' && 'border-green-500 bg-green-50 dark:bg-green-900/20'}
        ${status === 'error' && 'border-red-500 bg-red-50 dark:bg-red-900/20'}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        {/* Animated Icon */}
        <AnimatePresence mode="wait">
          {status === 'pending' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}
            >
              <Loader2 className="w-4 h-4 text-blue-500" />
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              <Check className="w-4 h-4 text-green-500" />
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                x: [0, -5, 5, -5, 5, 0],
              }}
              transition={{
                x: {
                  duration: 0.4,
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                },
              }}
            >
              <X className="w-4 h-4 text-red-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tool Name */}
        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
          {toolName}
        </span>
      </div>

      {/* Message (cascade in when present) */}
      <AnimatePresence>
        {message && (
          <motion.p
            className="text-xs text-gray-600 dark:text-gray-400 mt-1 ml-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

### Usage Example
```tsx
<ToolCallDisplay
  toolName="add_task"
  status="success"
  message="✓ Task created successfully"
/>
```
```

---

### Step 3: Design Gamification Elements

Create motivational game mechanics with visual feedback.

---

#### Example: Streak Counter

```markdown
## Streak Counter

**Purpose**: Motivation + Habit building
**Metric**: Consecutive days with at least 1 completed task
**Display**: Fire emoji + number + progress bar

### Visual Design
```
┌─────────────────────────────┐
│  🔥 7 Day Streak!           │
│  ▓▓▓▓▓▓▓░░░ 7/30 to Milestone│
│                              │
│  Keep it up! Complete at     │
│  least 1 task today.         │
└─────────────────────────────┘
```

### Animation Sequence

**Streak Increase** (daily):
1. Fire emoji scales up (1 → 1.3 → 1) with rotation
2. Number counts up (6 → 7) with slide up effect
3. Progress bar fills smoothly
4. Confetti burst on milestone (7, 30, 100 days)

**Streak Loss** (if missed a day):
1. Fire emoji fades to gray 💀
2. Shake animation (warning)
3. Number resets to 0
4. Motivational message: "Start a new streak today!"

### Implementation
```tsx
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StreakCounterProps {
  currentStreak: number;
  nextMilestone: number;
}

export function StreakCounter({ currentStreak, nextMilestone }: StreakCounterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const progress = (currentStreak / nextMilestone) * 100;

  useEffect(() => {
    // Animate on mount or streak change
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [currentStreak]);

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
      {/* Fire Emoji with Animation */}
      <div className="flex items-center gap-2 mb-2">
        <motion.span
          className="text-3xl"
          animate={isAnimating ? {
            scale: [1, 1.3, 1],
            rotate: [0, 10, -10, 0],
          } : {}}
          transition={{ duration: 0.6 }}
        >
          🔥
        </motion.span>

        {/* Streak Number */}
        <div className="flex flex-col">
          <motion.span
            className="text-2xl font-bold text-orange-600 dark:text-orange-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentStreak}
          >
            {currentStreak}
          </motion.span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Day Streak
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Milestone Text */}
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
        {currentStreak}/{nextMilestone} to next milestone
      </p>

      {/* Motivational Message */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
        {currentStreak === 0
          ? "🚀 Start your streak today!"
          : currentStreak < 7
          ? "💪 Keep it up!"
          : currentStreak < 30
          ? "🎯 You're on fire!"
          : "🏆 Legendary streak!"}
      </p>
    </div>
  );
}
```
```

---

#### Example: XP Progress Bar with Level Up

```markdown
## XP Progress Bar

**Purpose**: Gamification + Progress visualization
**Metric**: Experience points (XP) earned from completing tasks
**Display**: Progress bar + level + XP count

### XP Earning Rules
- Complete pending task: +10 XP
- Complete high priority task: +25 XP
- Complete task before due date: +5 XP bonus
- Daily goal achieved: +50 XP
- Maintain 7-day streak: +100 XP

### Level System
- Level 1: 0-100 XP
- Level 2: 100-250 XP
- Level 3: 250-500 XP
- Level 4: 500-1000 XP
- Level 5+: Exponential (1000 * 1.5^(level-4))

### Animation Sequence

**XP Gain**:
1. +XP indicator floats up from action (task complete)
2. Progress bar fills smoothly
3. XP count increments with counter animation

**Level Up**:
1. Progress bar fills to 100%
2. Confetti burst + sparkle effect
3. Level number scales up (2 → 3) with rotation
4. Badge unlock animation (if new badge earned)
5. Sound effect (optional)

### Implementation
```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface XPProgressBarProps {
  currentXP: number;
  level: number;
  xpToNextLevel: number;
}

export function XPProgressBar({
  currentXP,
  level,
  xpToNextLevel,
}: XPProgressBarProps) {
  const [previousXP, setPreviousXP] = useState(currentXP);
  const [xpGain, setXPGain] = useState<number | null>(null);
  const [previousLevel, setPreviousLevel] = useState(level);

  const progress = (currentXP / xpToNextLevel) * 100;

  useEffect(() => {
    // Detect XP gain
    if (currentXP > previousXP) {
      const gain = currentXP - previousXP;
      setXPGain(gain);
      setTimeout(() => setXPGain(null), 2000);
    }

    // Detect level up
    if (level > previousLevel) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
      });
    }

    setPreviousXP(currentXP);
    setPreviousLevel(level);
  }, [currentXP, level]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        {/* Level Badge */}
        <motion.div
          className="
            bg-gradient-to-br from-purple-500 to-blue-500
            text-white font-bold
            rounded-full w-12 h-12
            flex items-center justify-center
            shadow-lg
          "
          animate={level > previousLevel ? {
            scale: [1, 1.3, 1],
            rotate: [0, 360],
          } : {}}
          transition={{ duration: 0.6 }}
          key={level}
        >
          {level}
        </motion.div>

        {/* XP Count */}
        <div className="text-right">
          <motion.p
            className="text-xl font-bold text-purple-600 dark:text-purple-400"
            key={currentXP}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {currentXP} XP
          </motion.p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {xpToNextLevel - currentXP} to Level {level + 1}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* XP Gain Indicator */}
      <AnimatePresence>
        {xpGain !== null && (
          <motion.div
            className="
              absolute top-2 right-2
              bg-green-500 text-white
              font-bold text-sm
              px-2 py-1 rounded-full
              shadow-lg
            "
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.5 }}
            transition={{ duration: 1.5 }}
          >
            +{xpGain} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```
```

---

#### Example: Achievement Badge Unlock

```markdown
## Achievement Badge Unlock

**Purpose**: Delight + Motivation
**Trigger**: User completes achievement criteria
**Duration**: 2 seconds (reveal animation)
**Easing**: spring

### Badge Types
- **First Task**: Complete your first task
- **Task Master**: Complete 10 tasks
- **Speed Demon**: Complete 5 tasks in 1 hour
- **Priority King**: Complete 10 high-priority tasks
- **Week Warrior**: Maintain 7-day streak
- **Century Club**: Complete 100 tasks total

### Rarity Tiers
- **Common**: Gray background, bronze border
- **Rare**: Blue background, silver border
- **Epic**: Purple background, gold border
- **Legendary**: Rainbow gradient, platinum border

### Animation Sequence
1. **Modal appears**: Fade in + scale up from center
2. **Badge flip**: 3D card flip effect (front → back)
3. **Shine effect**: Light sweep across badge
4. **Confetti**: Burst from badge position
5. **XP bonus**: +50 XP floats up

### Implementation
```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface BadgeUnlockModalProps {
  badge: {
    id: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    icon: string;
    xpBonus: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function BadgeUnlockModal({
  badge,
  isOpen,
  onClose,
}: BadgeUnlockModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Confetti celebration
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  }, [isOpen]);

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-pink-500 via-purple-500 to-yellow-500',
  };

  const rarityBorders = {
    common: 'border-gray-500',
    rare: 'border-blue-500',
    epic: 'border-purple-500',
    legendary: 'border-yellow-500',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md shadow-2xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
              Achievement Unlocked! 🎉
            </h2>

            {/* Badge with Flip Animation */}
            <motion.div
              className="relative mx-auto mb-6"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 360 }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{ perspective: 1000 }}
            >
              <div
                className={`
                  w-32 h-32 rounded-full
                  bg-gradient-to-br ${rarityColors[badge.rarity]}
                  border-4 ${rarityBorders[badge.rarity]}
                  flex items-center justify-center
                  shadow-xl
                  relative overflow-hidden
                `}
              >
                {/* Badge Icon */}
                <span className="text-6xl">{badge.icon}</span>

                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    duration: 1,
                    delay: 0.5,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </motion.div>

            {/* Badge Info */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {badge.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {badge.description}
              </p>

              {/* XP Bonus */}
              <motion.div
                className="inline-block bg-green-500 text-white font-bold px-4 py-2 rounded-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                +{badge.xpBonus} XP
              </motion.div>

              {/* Rarity Badge */}
              <p className="text-xs uppercase font-bold mt-4 tracking-wide"
                style={{
                  background: `linear-gradient(to right, ${rarityColors[badge.rarity]})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {badge.rarity}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Usage Example
```tsx
const [showBadge, setShowBadge] = useState(false);

// When achievement unlocked
useEffect(() => {
  if (userCompletedFirstTask) {
    setShowBadge(true);
  }
}, [userCompletedFirstTask]);

<BadgeUnlockModal
  badge={{
    id: 'first-task',
    name: 'First Task',
    description: 'Completed your first task!',
    rarity: 'common',
    icon: '🎯',
    xpBonus: 50,
  }}
  isOpen={showBadge}
  onClose={() => setShowBadge(false)}
/>
```
```

---

### Step 4: Optimize for Performance

Ensure animations run at 60fps.

**Performance Checklist**:
```markdown
## Animation Performance Checklist

### ✅ GPU-Accelerated Properties
- [ ] Use `transform` (translate, scale, rotate) instead of position (top, left, bottom, right)
- [ ] Use `opacity` instead of visibility or display
- [ ] Avoid animating `width`, `height`, `padding`, `margin`

### ✅ Reduce Motion Support
- [ ] Detect user preference: `prefers-reduced-motion: reduce`
- [ ] Disable/simplify animations for users who prefer reduced motion
- [ ] Fallback to instant transitions

### ✅ Bundle Size
- [ ] Framer Motion: ~30KB gzipped (acceptable for value)
- [ ] Confetti library: ~2KB gzipped
- [ ] Tree-shake unused animation code

### ✅ Animation Timing
- [ ] Micro-interactions: 100-300ms
- [ ] Transitions: 300-500ms
- [ ] Celebrations: 500-1000ms
- [ ] Avoid animations longer than 1 second

### ✅ Use `will-change` Sparingly
```tsx
// Only use when animation is about to happen
<motion.div
  style={{ willChange: isAnimating ? 'transform, opacity' : 'auto' }}
>
  {/* Content */}
</motion.div>
```

### ✅ Debounce Frequent Animations
```tsx
const debouncedAnimate = useDebounce(triggerAnimation, 300);
```
```

---

### Step 5: Generate Output Specifications

Create specification files for implementation.

**File Structure**:
```
specs/
├── ui/
│   ├── animations.md           # All animation specifications
│   └── micro-interactions.md   # Detailed micro-interaction specs
├── gamification/
│   ├── badges.md               # Badge system specifications
│   ├── xp-levels.md            # XP and leveling system
│   ├── streaks.md              # Streak tracking system
│   └── daily-goals.md          # Daily goal system
└── performance/
    └── animation-performance.md # Performance guidelines
```

**Example: specs/ui/animations.md**:
```markdown
# Animation Specifications - Evolution of Todo

**Framework**: Framer Motion + Tailwind CSS
**Target**: 60fps, < 1 second duration
**Accessibility**: Reduced motion support

---

## Animation Catalog

| Animation | Trigger | Duration | Technique |
|-----------|---------|----------|-----------|
| Task Complete | Complete button | 600ms | Framer Motion + Confetti |
| Task Delete | Delete button | 400ms | Tailwind transition |
| Typing Indicator | AI processing | Infinite | Framer Motion loop |
| Tool Call | MCP tool invoke | Variable | AnimatePresence |
| XP Gain | Task complete | 800ms | Counter + progress bar |
| Level Up | XP threshold | 2000ms | Confetti + badge |
| Streak Increase | Daily login | 600ms | Scale + rotate |
| Badge Unlock | Achievement | 2000ms | 3D flip + shine |

---

[Include full specifications from previous steps]
```

---

## Related Agents

- **Frontend UI/UX Agent**: Primary owner, implements animations
- **AI Chatbot Agent**: Implements chat-specific animations (typing, tool calls)
- **Testing & QA Agent**: Tests animation performance and accessibility
- **Code Quality Agent**: Reviews animation code for performance

---

## Success Metrics

The Animations & Gamification Skill is successful when:

✅ **Performance**: All animations run at 60fps
✅ **Accessibility**: Reduced motion support implemented
✅ **Purposeful**: Every animation serves feedback/status/attention/delight/transition
✅ **Duration**: Micro-interactions < 500ms, celebrations < 2s
✅ **GPU Accelerated**: Using transform and opacity only
✅ **Bundle Size**: Framer Motion + animations < 50KB total
✅ **User Engagement**: Increased task completion rate with gamification
✅ **Delight Factor**: Positive user feedback on animations

---

## Best Practices

### Do's ✅

- **Use GPU-Accelerated Properties**: `transform` and `opacity` only
- **Add Reduced Motion Support**: Respect user preferences
- **Keep It Short**: Micro-interactions under 500ms
- **Test Performance**: Use Chrome DevTools Performance tab
- **Purposeful Animation**: Every animation should have a reason
- **Celebrate Wins**: Use confetti for achievements
- **Smooth Transitions**: Use easing functions (ease-out, spring)
- **Consistent Timing**: Use same durations for similar animations
- **Stagger Children**: Animate lists with stagger effect
- **Optimize Bundle**: Tree-shake unused Framer Motion features

### Don'ts ❌

- **Don't Animate Layout**: Avoid width, height, top, left, padding, margin
- **Don't Overdo It**: Too many animations cause fatigue
- **Don't Block Interactions**: Allow users to skip/cancel animations
- **Don't Ignore Performance**: Monitor FPS and jank
- **Don't Use Long Durations**: Keep animations under 1 second
- **Don't Forget Accessibility**: Always support reduced motion
- **Don't Animate on Scroll** (without throttling): Causes performance issues
- **Don't Use `will-change` Everywhere**: Only for active animations
- **Don't Nest Animations Deeply**: Keep animation logic flat
- **Don't Force Animations**: Let users opt out

---

## Integration with Other Skills

### Workflow Integration

```
UI Layout & Components (defines UI structure)
  ↓
ANIMATIONS & GAMIFICATION (this skill) ← Adds motion + motivation
  ↓
Code Generation (implements animations)
  ↓
Test Design (tests animation performance)
```

### Skill Combinations

**UI Layout & Components + Animations & Gamification**:
```
1. UI Layout defines TaskCard component
2. Animations skill adds complete animation + confetti
3. Code Generation implements with Framer Motion
```

**Gamification + API Specification**:
```
1. Gamification defines XP/badge system
2. API Specification creates endpoints: GET /api/user/xp, POST /api/user/badges
3. Integration Wiring connects frontend gamification UI to backend
```

---

## Output Format

When using this skill, generate:

**1. Micro-Interaction Specs** (Task complete, typing indicator, tool calls)
**2. Gamification Element Specs** (Streaks, XP, badges, levels)
**3. Implementation Code** (React + TypeScript + Framer Motion + Tailwind)
**4. Performance Guidelines** (60fps, GPU acceleration, reduced motion)
**5. Animation Catalog** (Table of all animations with triggers and durations)

Save specifications to:
- `specs/ui/animations.md` - All animation specifications
- `specs/gamification/badges.md` - Badge system
- `specs/gamification/xp-levels.md` - XP and leveling
- `specs/gamification/streaks.md` - Streak system

---

## References

- **UI Layout & Components**: `.claude/skills/ui-layout-components/README.md` (Component structure)
- **Framer Motion**: https://www.framer.com/motion/
- **Tailwind CSS Animation**: https://tailwindcss.com/docs/animation
- **Canvas Confetti**: https://www.npmjs.com/package/canvas-confetti
- **Web Animations API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
- **Reduced Motion**: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 8 (Task complete, typing indicator, tool call, streak counter, XP bar, badge unlock, performance, reduced motion)
**Coverage**: Phases II-III (Web App + AI Chatbot)

---

*This animations & gamification skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
