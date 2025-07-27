import * as vscode from 'vscode';

// Constants
const COLOR_CUSTOMIZATIONS_SECTION = 'workbench.colorCustomizations';
const STATE_MEMENTO_KEY = 'lynx-keymap.colorModeActive';
const CURRENT_COLOR_KEY = 'lynx-keymap.currentColor';

interface Colors {
  readonly BLUE: string;
  readonly GREEN: string;
  readonly ORANGE: string;
  readonly LEMON: string;
  readonly RED: string;
  readonly WHITE: string;
}

interface ColorNames {
  readonly GREEN: string;
  readonly BLUE: string;
  readonly ORANGE: string;
  readonly LEMON: string;
  readonly RED: string;
}

interface ColorCustomizations {
  'statusBar.background'?: string;
  'statusBar.foreground'?: string;
  'statusBarItem.remoteBackground'?: string;
}

const COLORS: Colors = {
  BLUE: '#0070bb',
  GREEN: '#1e5739',
  ORANGE: '#b85609',
  LEMON: '#6c8a01ff',
  RED: '#8b1538',
  WHITE: '#ffffff',
};

const COLOR_NAMES: ColorNames = {
  GREEN: 'GREEN',
  BLUE: 'BLUE',
  ORANGE: 'ORANGE',
  LEMON: 'LEMON',
  RED: 'RED',
};

type ColorKey = keyof typeof COLOR_NAMES;

export default class StatusBarManager {
  private context: vscode.ExtensionContext;
  private isInitialized: boolean = false;
  private colorKeys: ColorKey[] = ['GREEN', 'BLUE', 'ORANGE', 'LEMON', 'RED'];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.initializeCleanState();
  }

  // Public Methods

  /**
   * Toggles color mode with random color selection
   */
  public async toggleColorMode(): Promise<void> {
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
  public async toggleGreenMode(): Promise<void> {
    await this.toggleColorMode();
  }

  /**
   * Deactivates color mode (public for cleanup)
   */
  public async deactivateGreenMode(): Promise<void> {
    await this.deactivateColorMode();
  }

  // Private Methods

  /**
   * Initializes clean state every time VSCode is opened
   */
  private async initializeCleanState(): Promise<void> {
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
  private getRandomColor(): ColorKey {
    const randomIndex = Math.floor(Math.random() * this.colorKeys.length);
    return this.colorKeys[randomIndex];
  }

  /**
   * Applies random color to workspace configuration
   */
  private async activateRandomColorMode(): Promise<void> {
    const colorKey = this.getRandomColor();
    const color = COLORS[colorKey];

    const colorCustomizations: ColorCustomizations = {
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
  private async deactivateColorMode(): Promise<void> {
    await this.updateWorkspaceColors(undefined, false, 'deactivate');
    await this.context.workspaceState.update(CURRENT_COLOR_KEY, null);
  }

  /**
   * Helper method to update workspace colors and state
   */
  private async updateWorkspaceColors(
    colorCustomizations: ColorCustomizations | undefined,
    stateValue: boolean,
    action: string
  ): Promise<void> {
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