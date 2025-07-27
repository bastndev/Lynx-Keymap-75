import * as vscode from 'vscode';

interface WorkbenchColorCustomizations {
  'icon.foreground'?: string | null;
  [key: string]: any;
}

export default class ColorManager {
  private colors: (string | null)[] = [
    '#008dfa',    // Blue
    '#07cc4cff',  // Green
    null,         // Default (color theme)
  ];
  private currentColorIndex: number = 2; // Start with default color

  /**
   * Cycles through available colors
   */
  public async cycleIconColor(): Promise<void> {
    try {
      this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
      const newColor = this.colors[this.currentColorIndex];

      const config = vscode.workspace.getConfiguration();
      const currentCustomizations = config.get<WorkbenchColorCustomizations>('workbench.colorCustomizations', {});

      await config.update(
        'workbench.colorCustomizations',
        {
          ...currentCustomizations,
          'icon.foreground': newColor,
        },
        vscode.ConfigurationTarget.Global
      );
    } catch (error) {
      console.error('Error changing icon color:', error);
      vscode.window.showErrorMessage(
        'Failed to change icon color. Please try again.'
      );
    }
  }

  /**
   * Resets color to default value
   */
  public async resetToDefault(): Promise<void> {
    try {
      this.currentColorIndex = 2;
      const config = vscode.workspace.getConfiguration();
      const customizations = config.get<WorkbenchColorCustomizations>('workbench.colorCustomizations', {});

      delete customizations['icon.foreground'];

      await config.update(
        'workbench.colorCustomizations',
        customizations,
        vscode.ConfigurationTarget.Global
      );
    } catch (error) {
      console.error('Error resetting icon color:', error);
      vscode.window.showErrorMessage('Failed to reset icon color.');
    }
  }

  /**
   * Gets current color
   */
  public getCurrentColor(): string | null {
    return this.colors[this.currentColorIndex];
  }

  /**
   * Gets current color name
   */
  public getCurrentColorName(): string {
    const colorNames = ['Blue', 'Green', 'Default'];
    return colorNames[this.currentColorIndex];
  }
}