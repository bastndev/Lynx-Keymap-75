const vscode = require('vscode');

// Constants
const COLOR_CUSTOMIZATIONS_SECTION = 'workbench.colorCustomizations';
const STATE_MEMENTO_KEY = 'lynx-keymap.colorModeActive';
const CURRENT_COLOR_KEY = 'lynx-keymap.currentColor';

const COLORS = {
  BLUE: '#0070bb',
  GREEN: '#1e5739',
  ORANGE: '#b85609',
  LEMON: '#6c8a01ff',
  RED: '#8b1538',
  WHITE: '#ffffff',
};

const COLOR_NAMES = {
  GREEN: 'GREEN',
  BLUE: 'BLUE',
  ORANGE: 'ORANGE',
  LEMON: 'LEMON',
  RED: 'RED',
};

class StatusBarManager {
  constructor(context) {
    this.context = context;
    this.isInitialized = false;
    this.colorKeys = ['GREEN', 'BLUE', 'ORANGE', 'LEMON', 'RED'];
    this.initializeCleanState();
  }

  // Public Methods

  /**
   * Toggles color mode with random color selection
   */
  async toggleColorMode() {
    if (!this.isInitialized) {
      await this.initializeCleanState();
    }

    const isActive = this.context.workspaceState.get(STATE_MEMENTO_KEY, false);

    if (isActive) {
      await this.deactivateColorMode();
    } else {
      await this.activateRandomColorMode();
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async toggleGreenMode() {
    await this.toggleColorMode();
  }

  // Private Methods

  /**
   * Initializes clean state every time VSCode is opened
   */
  async initializeCleanState() {
    try {
      await this.context.workspaceState.update(STATE_MEMENTO_KEY, false);
      await this.context.workspaceState.update(CURRENT_COLOR_KEY, null);

      const config = vscode.workspace.getConfiguration();
      await config.update(
        COLOR_CUSTOMIZATIONS_SECTION,
        undefined,
        vscode.ConfigurationTarget.Workspace
      );

      this.isInitialized = true;
      console.log('Lynx Color Mode: State initialized cleanly');
    } catch (error) {
      console.error('Error initializing clean state:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Gets a random color key
   */
  getRandomColor() {
    const randomIndex = Math.floor(Math.random() * this.colorKeys.length);
    return this.colorKeys[randomIndex];
  }

  /**
   * Applies random color to workspace configuration
   */
  async activateRandomColorMode() {
    const colorKey = this.getRandomColor();
    const color = COLORS[colorKey];

    const colorCustomizations = {
      'statusBar.background': color,
      'statusBar.foreground': COLORS.WHITE,
      'statusBarItem.remoteBackground': color,
    };

    await this.updateWorkspaceColors(colorCustomizations, true, 'activate');
    await this.context.workspaceState.update(CURRENT_COLOR_KEY, colorKey);
  }

  /**
   * Clears workspace colors, returning to original state
   */
  async deactivateColorMode() {
    await this.updateWorkspaceColors(undefined, false, 'deactivate');
    await this.context.workspaceState.update(CURRENT_COLOR_KEY, null);
  }

  /**
   * Helper method to update workspace colors and state
   */
  async updateWorkspaceColors(colorCustomizations, stateValue, action) {
    try {
      const config = vscode.workspace.getConfiguration();
      await config.update(
        COLOR_CUSTOMIZATIONS_SECTION,
        colorCustomizations,
        vscode.ConfigurationTarget.Workspace
      );
      await this.context.workspaceState.update(STATE_MEMENTO_KEY, stateValue);
    } catch (error) {
      console.error(`Failed to ${action} color mode:`, error);
    }
  }
}

module.exports = StatusBarManager;