/**
 * ProgressBar Component
 * Visual progress indicator with percentage display
 */

export default function ProgressBar({
  percentage = 0,
  size = 'md',
  showLabel = true,
  colorScheme = 'auto',
  animated = false,
  className = ''
}) {
  // Ensure percentage is within bounds
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));

  // Size configurations
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-5'
  };

  // Color based on percentage or custom scheme
  const getColor = () => {
    if (colorScheme !== 'auto') {
      const colors = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        indigo: 'bg-indigo-500',
        purple: 'bg-purple-500'
      };
      return colors[colorScheme] || 'bg-blue-500';
    }

    // Auto color based on percentage
    if (normalizedPercentage === 100) return 'bg-green-500';
    if (normalizedPercentage >= 75) return 'bg-blue-500';
    if (normalizedPercentage >= 50) return 'bg-yellow-500';
    if (normalizedPercentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
          <div
            className={`
              ${sizeClasses[size]} ${getColor()} rounded-full
              transition-all duration-300 ease-out
              ${animated ? 'animate-pulse' : ''}
            `}
            style={{ width: `${normalizedPercentage}%` }}
          />
        </div>
        {showLabel && (
          <span className={`
            font-medium text-gray-700 min-w-[40px] text-right
            ${size === 'xs' || size === 'sm' ? 'text-xs' : 'text-sm'}
          `}>
            {normalizedPercentage}%
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * CircularProgress Component
 * Circular progress indicator
 */
export function CircularProgress({
  percentage = 0,
  size = 60,
  strokeWidth = 6,
  showLabel = true,
  colorScheme = 'auto'
}) {
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedPercentage / 100) * circumference;

  const getColor = () => {
    if (colorScheme !== 'auto') {
      const colors = {
        blue: 'text-blue-500',
        green: 'text-green-500',
        yellow: 'text-yellow-500',
        red: 'text-red-500',
        indigo: 'text-indigo-500'
      };
      return colors[colorScheme] || 'text-blue-500';
    }

    if (normalizedPercentage === 100) return 'text-green-500';
    if (normalizedPercentage >= 75) return 'text-blue-500';
    if (normalizedPercentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          className={`transition-all duration-300 ease-out ${getColor()}`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset
          }}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-xs font-semibold text-gray-700">
          {normalizedPercentage}%
        </span>
      )}
    </div>
  );
}
