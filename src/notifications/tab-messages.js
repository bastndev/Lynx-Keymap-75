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
   * Now optimized for automatic startup display
   * @param {number} duration - Duration to show the message
   */
  static showAILoadingMessage(duration = 4000) {
    this.showStatusMessage(
      'Initializing Lynx',
      'Loading Lynx Keymap extension...',
      duration,
      'loading'
    );
    this.logInfo('Extension initialization started');
  }

  /**
   * Shows AI ready notification
   * @param {string} message - Success message to display
   */
  static showAIReadyMessage(message = 'Lynx Ready') {
    this.showStatusMessage(
      message,
      'Lynx Keymap extension is ready to use',
      2000,
      '✅'
    );
    this.logSuccess(`Extension ready: ${message}`);
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
    this.logInfo('Status messages cleared - Extension fully loaded');
  }

    static showStartupNotifications() {
      const totalDuration = 4000;
      
      // Phase 1: Loading animation (2.5 seconds)
      this.showAILoadingMessage(2500);
      
      // Phase 2: Completion message (1.5 seconds)
      setTimeout(() => {
        this.showAIReadyMessage('Lynx Keymap Ready');
      }, 2500);
      
      this.logInfo('Startup notification sequence initiated');
    }

    /**
     * Simplified method to show only the automatic loading message
     * Exact duration of 4 seconds as requested
     */
    static showAutoStartupMessage() {
      this.showStatusMessage(
        'Loading Lynx Keymap',
        'Extension is starting up...',
        4000, // Exactly 4 seconds
        'loading'
      );
      this.logInfo('Auto startup message displayed for 4 seconds');
    }
  }

module.exports = TabMessageManager;
