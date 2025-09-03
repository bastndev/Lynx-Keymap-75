const vscode = require('vscode');

/**
 * Utility class for managing extension messages and notifications
 */
class TabMessageManager {
  // Static variables to track active status bar items
  static currentStatusItem = null;
  static statusTimeout = null;
  static animationInterval = null;
  static animationFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  static currentFrame = 0;

  static showError(message) {
    return vscode.window.showWarningMessage(`Lynx Keymap: ${message}`);
  }

  static logInfo(message) {
    console.log(`🔵 Lynx Keymap: ${message}`);
  }

  static logSuccess(message) {
    console.log(`✅ Lynx Keymap: ${message}`);
  }

  static logError(message, error = null) {
    console.error(`❌ Lynx Keymap: ${message}`, error || '');
  }

  /**
   * Shows a temporary status message in the status bar
   * @param {string} text - The text to display
   * @param {string} tooltip - Tooltip text
   * @param {number} duration - Duration to show the message in milliseconds
   * @param {string} icon - Optional icon (e.g., 'loading', '✅', '❌')
   */
  static showStatusMessage(text, tooltip = '', duration = 2000, icon = '') {
    // Clear any existing status message
    this.clearStatusMessage();

    const statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      0
    );
    statusBarItem.tooltip = tooltip || text;
    statusBarItem.show();

    // Store reference to current item
    this.currentStatusItem = statusBarItem;

    // Handle animated loading icon
    if (icon === 'loading') {
      this.currentFrame = 0;
      statusBarItem.text = `${this.animationFrames[0]} ${text}`;

      // Optimized animation - faster frame rate for smoother animation
      this.animationInterval = setInterval(() => {
        this.currentFrame =
          (this.currentFrame + 1) % this.animationFrames.length;
        if (this.currentStatusItem) {
          this.currentStatusItem.text = `${
            this.animationFrames[this.currentFrame]
          } ${text}`;
        }
      }, 80); // Reduced from 100ms to 80ms for smoother animation
    } else {
      // Static icon
      const displayText = icon ? `${icon} ${text}` : text;
      statusBarItem.text = displayText;
    }

    // Auto-hide after duration
    this.statusTimeout = setTimeout(() => {
      this.clearStatusMessage();
    }, duration);

    return statusBarItem;
  }

  /**
   * Shows a fast loading message for AI operations
   * Optimized for quicker startup and smoother animation
   * @param {number} duration - Duration to show the message (reduced default)
   */
  static showAILoadingMessage(duration = 2000) { // Reduced from 4000ms to 2000ms
    this.showStatusMessage(
      'Initializing Lynx',
      'Loading Lynx Keymap extension...',
      duration,
      'loading'
    );
    this.logInfo('Extension initialization started');
  }

  /**
   * Shows AI error message
   * @param {string} message - Error message to display
   */
  static showAIErrorMessage(message = 'Lynx Error') {
    this.showStatusMessage(message, 'Extension command failed to execute', 3000, '❌');
    this.logError(`Extension error: ${message}`);
  }

  /**
   * Clears any active status message
   */
  static clearStatusMessage() {
    // Clear animation interval
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }

    // Clear timeout
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = null;
    }

    // Dispose status bar item
    if (this.currentStatusItem) {
      this.currentStatusItem.dispose();
      this.currentStatusItem = null;
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  static clearLoadingMessage() {
    this.clearStatusMessage();
    this.logInfo('Extension fully loaded - Ready for use');
  }

  /**
   * Optimized startup method - only shows loading animation
   * Faster initialization without the "ready" message
   */
  static showStartupNotifications() {
    // Only show loading animation for 2 seconds
    this.showAILoadingMessage(2000);
    this.logInfo('Fast startup sequence initiated');
  }

  /**
   * Simplified method to show only the automatic loading message
   * Reduced to 2 seconds for faster startup
   */
  static showAutoStartupMessage() {
    this.showStatusMessage(
      'Loading Lynx Keymap',
      'Extension is starting up...',
      2000, // Reduced from 4000ms to 2000ms
      'loading'
    );
    this.logInfo('Auto startup message displayed for 2 seconds');
  }

  /**
   * Instant startup method - minimal loading time
   * For cases where you want the fastest possible initialization
   */
  static showInstantStartup() {
    this.showStatusMessage(
      'Lynx Ready',
      'Extension loaded successfully',
      1000, // Very short duration
      '⚡' // Lightning bolt for speed
    );
    this.logSuccess('Instant startup completed');
  }
}

module.exports = TabMessageManager;
