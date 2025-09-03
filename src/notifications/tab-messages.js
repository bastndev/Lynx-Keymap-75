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

      // Start animation
      this.animationInterval = setInterval(() => {
        this.currentFrame =
          (this.currentFrame + 1) % this.animationFrames.length;
        if (this.currentStatusItem) {
          this.currentStatusItem.text = `${
            this.animationFrames[this.currentFrame]
          } ${text}`;
        }
      }, 100);
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
   * Shows a loading message for AI operations
   * @param {string} keyCombo - The key combination being executed
   * @param {number} duration - Duration to show the message
   */
  static showAILoadingMessage(keyCombo = 'AI Command', duration = 2000) {
    this.showStatusMessage(
      'Loading AI',
      `Executing: ${keyCombo}`,
      duration,
      'loading'
    );
    this.logInfo(`Loading AI for: ${keyCombo}`);
  }

  /**
   * Shows AI ready notification
   * @param {string} message - Success message to display
   */
  static showAIReadyMessage(message = 'AI Ready') {
    this.logSuccess(`AI ready: ${message}`);
  }

  /**
   * Shows AI error message
   * @param {string} message - Error message to display
   */
  static showAIErrorMessage(message = 'AI Error') {
    this.showStatusMessage(message, 'AI command failed to execute', 3000, '❌');
    this.logError(`AI error: ${message}`);
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
    this.logInfo('Cleared status messages - AI fully initialized');
  }
}

module.exports = TabMessageManager;
