import * as vscode from 'vscode';

const COLOR_CUSTOMIZATIONS_SECTION = 'workbench.colorCustomizations';
const STATE_MEMENTO_KEY = 'lynx-keymap.colorModeActive';
const CURRENT_COLOR_KEY = 'lynx-keymap.currentColor';
const COLOR_HISTORY_KEY = 'lynx-keymap.colorHistory';

const COLORS: Record<string, string> = {
  BLUE: '#253c52',
  PURPLE: '#3d2952',
  ORANGE: '#4a3c2b',
  LEMON: '#51641bff',
  RED: '#4a2b2f',
  GREEN: '#1e5739',
  WHITE: '#ffffff'
};

const COLOR_NAMES: Record<string, string> = {
  PURPLE: 'PURPLE',
  BLUE: 'BLUE',
  ORANGE: 'ORANGE',
  LEMON: 'LEMON',
  RED: 'RED',
  GREEN: 'GREEN'
};

export class StatusBarManager {
  private context: vscode.ExtensionContext;
  private isInitialized: boolean = false;
  private colorKeys: string[] = ['PURPLE', 'BLUE', 'ORANGE', 'LEMON', 'RED', 'GREEN'];
  private maxHistorySize: number = 3;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.initializeCleanState();
  }

  async toggleColorMode(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeCleanState();
    }

    const isActive = this.context.workspaceState.get(STATE_MEMENTO_KEY, false);

    if (isActive) {
      await this.deactivateColorMode();
    } else {
      await this.activateSmartColorMode();
    }
  }

  async toggleStatusBarColor(): Promise<void> {
    await this.toggleColorMode();
  }

  async initializeCleanState(): Promise<void> {
    try {
      await this.context.workspaceState.update(STATE_MEMENTO_KEY, false);
      await this.context.workspaceState.update(CURRENT_COLOR_KEY, null);
      await this.context.workspaceState.update(COLOR_HISTORY_KEY, []);

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

  getColorHistory(): string[] {
    return this.context.workspaceState.get(COLOR_HISTORY_KEY, []);
  }

  async updateColorHistory(colorKey: string): Promise<void> {
    let history = this.getColorHistory();
    history.unshift(colorKey);
    if (history.length > this.maxHistorySize) {
      history = history.slice(0, this.maxHistorySize);
    }
    await this.context.workspaceState.update(COLOR_HISTORY_KEY, history);
  }

  getAvailableColors(): string[] {
    const history = this.getColorHistory();
    const availableColors = this.colorKeys.filter(color => !history.includes(color));
    if (availableColors.length === 0) {
      const lastUsedColor = history[0];
      return this.colorKeys.filter(color => color !== lastUsedColor);
    }
    return availableColors;
  }

  getSmartColor(): string {
    const availableColors = this.getAvailableColors();
    if (availableColors.length === 0) {
      const currentColor = this.context.workspaceState.get(CURRENT_COLOR_KEY);
      const fallbackColors = this.colorKeys.filter(color => color !== currentColor);
      const randomIndex = Math.floor(Math.random() * fallbackColors.length);
      return fallbackColors[randomIndex];
    }
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex];
  }

  async activateSmartColorMode(): Promise<void> {
    const colorKey = this.getSmartColor();
    const color = COLORS[colorKey];

    const colorCustomizations: Record<string, string> = {
      'statusBar.background': color,
      'statusBar.foreground': COLORS.WHITE,
      'statusBarItem.remoteBackground': color,
    };

    await this.updateWorkspaceColors(colorCustomizations, true, 'activate');
    await this.context.workspaceState.update(CURRENT_COLOR_KEY, colorKey);
    await this.updateColorHistory(colorKey);

    console.log(`Lynx Color Mode: Activated with color ${colorKey}`);
    console.log(`Color history: ${JSON.stringify(this.getColorHistory())}`);
  }

  async deactivateColorMode(): Promise<void> {
    await this.updateWorkspaceColors(undefined, false, 'deactivate');
    await this.context.workspaceState.update(CURRENT_COLOR_KEY, null);

    console.log('Lynx Color Mode: Deactivated');
  }

  async updateWorkspaceColors(colorCustomizations: Record<string, string> | undefined, stateValue: boolean, action: string): Promise<void> {
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

  getDebugInfo(): { isActive: boolean; currentColor: string | null; colorHistory: string[]; availableColors: string[] } {
    return {
      isActive: this.context.workspaceState.get(STATE_MEMENTO_KEY, false),
      currentColor: this.context.workspaceState.get(CURRENT_COLOR_KEY, null),
      colorHistory: this.getColorHistory(),
      availableColors: this.getAvailableColors()
    };
  }
}
