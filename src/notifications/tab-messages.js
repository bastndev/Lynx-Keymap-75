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
   * This method is now only used at startup, not for key combinations
   * @param {number} duration - Duration to show the message
   */
  static showAILoadingMessage(duration = 3000) {
    // No longer triggered by key combinations
    this.showStatusMessage(
      'Loading AI',
      'Initializing Lynx Keymap',
      duration,
      'loading'
    );
    this.logInfo('AI initialization started');
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

  /**
   * Shows startup notifications sequence including icons
   * Will display loading, warning, and success messages in sequence
   */
  static showStartupNotifications() {
    const duration = 3000; // 3 seconds total duration
    const stepTime = duration / 3; // Split into three phases

    // Phase 1: Loading animation
    this.showAILoadingMessage(stepTime);
    
    // Phase 2: Warning message (after loading animation)
    setTimeout(() => {
      this.showStatusMessage(
        'Extension Check',
        'Checking required extensions',
        stepTime,
        '⚠️'
      );
    }, stepTime);
    
    // Phase 3: Success message (after warning)
    setTimeout(() => {
      this.showStatusMessage(
        'Lynx Keymap Ready',
        'Extension successfully loaded',
        stepTime,
        '✅'
      );
    }, stepTime * 2);
  }
}

module.exports = TabMessageManager;
