/**
 * RoleSelector Component
 * Dropdown for selecting user roles
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { ROLE_CONFIG, getAssignableRoles, isValidRole } from '../../src/models/rolePermissions';

export default function RoleSelector({
  value,
  onChange,
  userRole,
  disabled = false,
  excludeRoles = [],
  size = 'md',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get assignable roles based on current user's role
  const assignableRoles = getAssignableRoles(userRole).filter(
    role => !excludeRoles.includes(role)
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRole = ROLE_CONFIG[value];

  const sizeClasses = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-3 text-sm',
    lg: 'py-2.5 px-4 text-base'
  };

  if (!currentRole) return null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-2 w-full
          bg-white border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:bg-gray-50 cursor-pointer'}
          ${sizeClasses[size]}
        `}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${currentRole.bgColor.replace('bg-', 'bg-')}`}
                style={{ backgroundColor: currentRole.color === 'purple' ? '#9333EA' :
                         currentRole.color === 'red' ? '#DC2626' :
                         currentRole.color === 'orange' ? '#F97316' :
                         currentRole.color === 'blue' ? '#3B82F6' : '#6B7280' }} />
          <span className="font-medium">{currentRole.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {assignableRoles.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No roles available
            </div>
          ) : (
            assignableRoles.map((role) => {
              const config = ROLE_CONFIG[role];
              const isSelected = value === role;

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    onChange(role);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between gap-2 px-3 py-2
                    text-left hover:bg-gray-50 transition-colors
                    ${isSelected ? 'bg-indigo-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: config.color === 'purple' ? '#9333EA' :
                               config.color === 'red' ? '#DC2626' :
                               config.color === 'orange' ? '#F97316' :
                               config.color === 'blue' ? '#3B82F6' : '#6B7280' }}
                    />
                    <div>
                      <div className="font-medium text-sm">{config.label}</div>
                      <div className="text-xs text-gray-500">{config.description}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
