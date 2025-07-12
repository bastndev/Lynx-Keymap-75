const vscode = require('vscode');

const PEACOCK_SECTION = 'workbench.colorCustomizations';
const STATE_MEMENTO_KEY = 'lynx-keymap.greenModeActive';

const COLORS = {
  GREEN: '#2f9e44',
  WHITE: '#ffffff',
};

class PeacockManager {
  constructor(context) {
    this.context = context;
    this.isInitialized = false;
    this.initializeCleanState();
  }

  /**
   * Initializes clean state every time VSCode is opened
   */
  async initializeCleanState() {
    try {
      await this.context.workspaceState.update(STATE_MEMENTO_KEY, false);

      const config = vscode.workspace.getConfiguration();
      await config.update(
        PEACOCK_SECTION,
        undefined,
        vscode.ConfigurationTarget.Workspace
      );

      this.isInitialized = true;
      console.log('Lynx Green Mode: State initialized cleanly');
    } catch (error) {
      console.error('Error initializing clean state:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Toggles green mode. Activates if deactivated, deactivates if activated.
   */
  async toggleGreenMode() {
    if (!this.isInitialized) {
      await this.initializeCleanState();
    }

    const isActive = this.context.workspaceState.get(STATE_MEMENTO_KEY, false);

    if (isActive) {
      await this.deactivateGreenMode();
    } else {
      await this.activateGreenMode();
    }
  }

  /**
   * Applies green colors to workspace configuration.
   */
  async activateGreenMode() {
    const colorCustomizations = {
      'statusBar.background': COLORS.GREEN,
      'statusBar.foreground': COLORS.WHITE,
      'statusBarItem.remoteBackground': COLORS.GREEN,
    };

    await this.updateWorkspaceColors(colorCustomizations, true, 'activate');
  }

  /**
   * Clears workspace colors, returning to original state.
   */
  async deactivateGreenMode() {
    await this.updateWorkspaceColors(undefined, false, 'deactivate');
  }

  /**
   * Helper method to update workspace colors and state.
   */
  async updateWorkspaceColors(colorCustomizations, stateValue, action) {
    try {
      const config = vscode.workspace.getConfiguration();
      await config.update(
        PEACOCK_SECTION,
        colorCustomizations,
        vscode.ConfigurationTarget.Workspace
      );
      await this.context.workspaceState.update(STATE_MEMENTO_KEY, stateValue);
    } catch (error) {
      console.error(`Failed to ${action} green mode:`, error);
      vscode.window.showErrorMessage(
        `Could not ${
          action === 'activate' ? 'apply' : 'remove'
        } Lynx Green Mode.`
      );
    }
  }
}

module.exports = PeacockManager;
