import readline from 'readline';

/**
 * KeyboardService - Keyboard shortcut handling
 * Phase 4: Power User Enhancements
 */

// State
let isInitialized = false;
let isEnabled = false;
let shortcuts = new Map();
let keypressHandler = null;

/**
 * Initialize keyboard shortcut handling
 * @returns {boolean} True if shortcuts enabled (TTY), false if not available
 */
export function initKeyboard() {
  // Check if stdin is a TTY
  if (!process.stdin.isTTY) {
    return false;
  }

  if (isInitialized) {
    return true;
  }

  try {
    readline.emitKeypressEvents(process.stdin);

    keypressHandler = (str, key) => {
      if (isEnabled) {
        handleKeypress(str, key);
      }
    };

    process.stdin.on('keypress', keypressHandler);

    isInitialized = true;
    isEnabled = true;

    return true;
  } catch (error) {
    console.error('Failed to initialize keyboard shortcuts:', error.message);
    return false;
  }
}

/**
 * Disable keyboard shortcuts (during prompts)
 */
export function disableKeyboard() {
  isEnabled = false;

  // Restore normal stdin mode during prompts
  if (process.stdin.isTTY && process.stdin.isRaw) {
    try {
      process.stdin.setRawMode(false);
    } catch (e) {
      // Ignore errors
    }
  }
}

/**
 * Enable keyboard shortcuts after prompts
 */
export function enableKeyboard() {
  if (!isInitialized) {
    return;
  }

  isEnabled = true;

  // Set raw mode for key capture
  if (process.stdin.isTTY) {
    try {
      process.stdin.setRawMode(true);
    } catch (e) {
      // Ignore errors
    }
  }
}

/**
 * Register a keyboard shortcut
 * @param {string} key - Key character or name
 * @param {string} description - Description for help display
 * @param {Function} handler - Function to call when key pressed
 */
export function registerShortcut(key, description, handler) {
  shortcuts.set(key.toLowerCase(), {
    key: key,
    description: description,
    handler: handler
  });
}

/**
 * Get all registered shortcuts for help display
 * @returns {Array<{key: string, description: string}>}
 */
export function getShortcuts() {
  return Array.from(shortcuts.values()).map(s => ({
    key: s.key,
    description: s.description
  }));
}

/**
 * Handle keypress event
 * @param {string} str - Key string
 * @param {Object} keyInfo - Key information
 */
function handleKeypress(str, keyInfo) {
  if (!isEnabled) {
    return;
  }

  // Handle Ctrl+C for exit
  if (keyInfo && keyInfo.ctrl && keyInfo.name === 'c') {
    process.emit('SIGINT');
    return;
  }

  // Handle escape key
  if (keyInfo && keyInfo.name === 'escape') {
    const escHandler = shortcuts.get('escape');
    if (escHandler) {
      escHandler.handler();
    }
    return;
  }

  // Handle regular keys
  const key = str?.toLowerCase();
  if (key && shortcuts.has(key)) {
    shortcuts.get(key).handler();
    return;
  }

  // Handle special keys (arrows, enter, etc.)
  if (keyInfo && keyInfo.name) {
    const specialKey = keyInfo.name.toLowerCase();
    if (shortcuts.has(specialKey)) {
      shortcuts.get(specialKey).handler();
    }
  }
}

/**
 * Check if keyboard shortcuts are available
 * @returns {boolean}
 */
export function isAvailable() {
  return process.stdin.isTTY;
}

/**
 * Check if keyboard shortcuts are currently enabled
 * @returns {boolean}
 */
export function isShortcutsEnabled() {
  return isInitialized && isEnabled;
}

/**
 * Cleanup keyboard handling
 */
export function cleanup() {
  if (isInitialized && keypressHandler) {
    process.stdin.removeListener('keypress', keypressHandler);
  }

  if (process.stdin.isTTY && process.stdin.isRaw) {
    try {
      process.stdin.setRawMode(false);
    } catch (e) {
      // Ignore errors
    }
  }

  isInitialized = false;
  isEnabled = false;
  shortcuts.clear();
}

export default {
  initKeyboard,
  disableKeyboard,
  enableKeyboard,
  registerShortcut,
  getShortcuts,
  isAvailable,
  isShortcutsEnabled,
  cleanup
};
