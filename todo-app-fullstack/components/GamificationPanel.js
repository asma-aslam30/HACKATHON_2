import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GamificationPanel({ userStats }) {
  const [currentXP, setCurrentXP] = useState(userStats?.totalXP || 0);
  const [level, setLevel] = useState(userStats?.level || 1);
  const [streak, setStreak] = useState(userStats?.streak || 0);
  const [badges, setBadges] = useState(userStats?.badges || []);
  const [showXPGain, setShowXPGain] = useState(null);

  // Each level requires 100 XP (matches index.js: Math.floor(totalXP / 100) + 1)
  const XP_PER_LEVEL = 100;
  const xpToNextLevel = XP_PER_LEVEL;
  const currentLevelXP = currentXP % XP_PER_LEVEL;
  const progress = (currentLevelXP / XP_PER_LEVEL) * 100;

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
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200 mb-4">
      {/* Level + XP */}
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg flex-shrink-0"
          animate={level > (userStats?.level || 1) ? { scale: [1, 1.3, 1], rotate: [0, 360] } : {}}
          transition={{ duration: 0.6 }}
        >
          {level}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-purple-700">Level</p>
            <p className="text-xs text-gray-500">XP: {currentXP}</p>
          </div>
          {/* XP Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{XP_PER_LEVEL - currentLevelXP} XP to Level {level + 1}</p>
        </div>
        <AnimatePresence>
          {showXPGain && (
            <motion.div
              className="bg-green-500 text-white font-bold text-xs px-2 py-1 rounded-full shadow"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
              +{showXPGain} XP
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Streak */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🔥</span>
            <p className="text-sm font-semibold text-orange-600">Streak</p>
          </div>
          <p className="text-xs text-gray-500">{streak} days</p>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((streak / nextMilestone) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{nextMilestone - streak} days to next milestone</p>
      </div>

      {/* Badges */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-600 mb-1.5">Badges</p>
        <div className="flex gap-1.5 flex-wrap">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1
                ${badge.rarity === 'common' ? 'bg-gray-200 text-gray-800' :
                  badge.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
                  badge.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
                  'bg-yellow-200 text-yellow-800'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <span>{badge.icon}</span>{badge.name}
            </motion.div>
          ))}
          {badges.length === 0 && (
            <p className="text-xs text-gray-400 italic">No badges yet. Complete tasks to earn badges!</p>
          )}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="p-2.5 bg-white/60 rounded-lg">
        <p className="text-xs text-gray-600">
          {streak === 0 ? "🚀 Start your streak today! Complete a task to begin."
            : streak < 7 ? "💪 Keep it up! You're building a great habit."
            : streak < 30 ? "🎯 You're on fire! Keep completing tasks daily."
            : "🏆 Legendary streak! You're a task completion master."}
        </p>
      </div>
    </div>
  );
}