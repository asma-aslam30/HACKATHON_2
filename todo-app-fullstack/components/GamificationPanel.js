import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamificationPanel({ userStats }) {
  const [currentXP, setCurrentXP] = useState(userStats?.totalXP || 0);
  const [level, setLevel] = useState(userStats?.level || 1);
  const [streak, setStreak] = useState(userStats?.streak || 0);
  const [badges, setBadges] = useState(userStats?.badges || []);
  const [showXPGain, setShowXPGain] = useState(null);

  // Calculate XP needed for next level (simplified: 100 XP per level)
  const xpToNextLevel = level * 100;
  const currentLevelXP = currentXP % xpToNextLevel;
  const progress = (currentLevelXP / xpToNextLevel) * 100;

  // Handle XP gain animation
  useEffect(() => {
    if (userStats?.lastXPGain && userStats.lastXPGain > 0) {
      setShowXPGain(userStats.lastXPGain);
      setCurrentXP(userStats.totalXP);
      setLevel(userStats.level);
      setStreak(userStats.streak);

      const timer = setTimeout(() => setShowXPGain(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [userStats]);

  // Calculate next milestone for streak
  const nextMilestone = [7, 14, 30, 100].find(m => m > streak) || streak + 7;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 mb-6">
      <div className="flex flex-wrap gap-4">
        {/* XP Progress Bar */}
        <div className="flex-1 min-w-[250px]">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <motion.div
                className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                animate={level > (userStats?.level || 1) ? {
                  scale: [1, 1.3, 1],
                  rotate: [0, 360],
                } : {}}
                transition={{ duration: 0.6 }}
              >
                {level}
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Level</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">XP: {currentXP}</p>
              </div>
            </div>

            {/* XP Gain Indicator */}
            <AnimatePresence>
              {showXPGain && (
                <motion.div
                  className="bg-green-500 text-white font-bold text-sm px-2 py-1 rounded-full shadow-lg"
                  initial={{ opacity: 0, y: -20, scale: 0.5 }}
                  animate={{ opacity: 1, y: -40, scale: 1 }}
                  exit={{ opacity: 0, y: -60, scale: 0.5 }}
                  transition={{ duration: 1.5 }}
                >
                  +{showXPGain} XP
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {xpToNextLevel - currentLevelXP} XP to Level {level + 1}
          </p>
        </div>

        {/* Streak Counter */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <motion.span
              className="text-2xl"
              animate={streak > (userStats?.streak || 0) ? {
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0],
              } : {}}
              transition={{ duration: 0.6 }}
            >
              🔥
            </motion.span>
            <div>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">Streak</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{streak} days</p>
            </div>
          </div>

          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${(streak / nextMilestone) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {nextMilestone - streak} days to next milestone
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Badges</p>
        <div className="flex gap-2 flex-wrap">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              className={`
                px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
                ${badge.rarity === 'common' ? 'bg-gray-200 text-gray-800' :
                  badge.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
                  badge.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
                  'bg-yellow-200 text-yellow-800'}
              `}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <span>{badge.icon}</span>
              {badge.name}
            </motion.div>
          ))}
          {badges.length === 0 && (
            <p className="text-xs text-gray-500 italic">No badges yet. Complete tasks to earn badges!</p>
          )}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {streak === 0
            ? "🚀 Start your streak today! Complete a task to begin."
            : streak < 7
            ? "💪 Keep it up! You're building a great habit."
            : streak < 30
            ? "🎯 You're on fire! Keep completing tasks daily."
            : "🏆 Legendary streak! You're a task completion master."
          }
        </p>
      </div>
    </div>
  );
}