/**
 * RoleBadge Component
 * Displays a user's role with appropriate styling
 */

import { ROLE_CONFIG } from '../../src/models/rolePermissions';

export default function RoleBadge({ role, size = 'sm', showDescription = false }) {
  const config = ROLE_CONFIG[role];

  if (!config) {
    return null;
  }

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <div className="inline-flex items-center gap-1">
      <span
        className={`
          inline-flex items-center font-medium rounded-full
          ${config.bgColor} ${config.textColor} ${config.borderColor}
          border ${sizeClasses[size]}
        `}
      >
        {config.label}
      </span>
      {showDescription && (
        <span className="text-xs text-gray-500">{config.description}</span>
      )}
    </div>
  );
}
