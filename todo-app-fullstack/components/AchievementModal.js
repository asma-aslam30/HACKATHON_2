import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function AchievementModal({ achievement, isOpen, onClose }) {
  if (!achievement) return null;

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
                  bg-gradient-to-br ${rarityColors[achievement.rarity]}
                  border-4 ${rarityBorders[achievement.rarity]}
                  flex items-center justify-center
                  shadow-xl
                  relative overflow-hidden
                `}
              >
                {/* Badge Icon */}
                <span className="text-6xl">{achievement.icon}</span>

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
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {achievement.description}
              </p>

              {/* XP Bonus */}
              <motion.div
                className="inline-block bg-green-500 text-white font-bold px-4 py-2 rounded-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                +{achievement.xpBonus} XP
              </motion.div>

              {/* Rarity Badge */}
              <p
                className="text-xs uppercase font-bold mt-4 tracking-wide"
                style={{
                  background: `linear-gradient(to right, ${rarityColors[achievement.rarity]})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {achievement.rarity}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}