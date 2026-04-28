import * as vscode from 'vscode';

interface ColorEntry {
  value: string | null;
  name: string;
}

export class ColorManager {
  static CONFIG = {
    WORKBENCH_KEY: 'workbench.colorCustomizations',
    ICON_KEY: 'icon.foreground',
    TARGET: vscode.ConfigurationTarget.Global
  };

  static COLORS: ColorEntry[] = [
    { value: '#008dfa', name: 'Blue' },
    { value: '#10B981', name: 'Green' },
    { value: null, name: 'Default' }
  ];

  private colors: ColorEntry[];
  private currentColorIndex: number;

  constructor() {
    this.colors = [...ColorManager.COLORS];
    this.currentColorIndex = this.colors.length - 1;
    this._syncWithCurrentState();
  }

  private _syncWithCurrentState(): void {
    try {
      const config = vscode.workspace.getConfiguration();
      const customizations = config.get<Record<string, string>>(ColorManager.CONFIG.WORKBENCH_KEY, {});
      const currentIconColor = customizations[ColorManager.CONFIG.ICON_KEY];

      const foundIndex = this.colors.findIndex(color => color.value === currentIconColor);
      
      if (foundIndex !== -1) {
        this.currentColorIndex = foundIndex;
      } else {
        this.currentColorIndex = this.colors.length - 1;
      }
    } catch (error) {
      console.error('Error syncing color state:', error);
      this.currentColorIndex = this.colors.length - 1;
    }
  }

  async refreshState(): Promise<{ currentColor: string; currentValue: string | null; totalColors: number; availableColors: string[]; currentIndex: number }> {
    this._syncWithCurrentState();
    return this.getStatus();
  }

  async cycleIconColor(): Promise<{ success: boolean; color?: ColorEntry; error?: string }> {
    try {
      this._syncWithCurrentState();
      
      this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
      const currentColor = this.getCurrentColor();
      
      await this._updateIconColor(currentColor.value);
      
      return { 
        success: true, 
        color: currentColor 
      };
    } catch (error) {
      return this._createErrorResult('Error cycling icon color', error as Error);
    }
  }

  async resetToDefault(): Promise<{ success: boolean; error?: string }> {
    try {
      this.currentColorIndex = this.colors.length - 1;
      
      const config = vscode.workspace.getConfiguration();
      const customizations = { ...config.get<Record<string, string>>(ColorManager.CONFIG.WORKBENCH_KEY, {}) };
      
      delete customizations[ColorManager.CONFIG.ICON_KEY];
      
      await config.update(
        ColorManager.CONFIG.WORKBENCH_KEY,
        Object.keys(customizations).length ? customizations : undefined,
        ColorManager.CONFIG.TARGET
      );

      return { success: true };
    } catch (error) {
      return this._createErrorResult('Error resetting icon color', error as Error);
    }
  }

  async setColorByName(colorName: string): Promise<{ success: boolean; color?: ColorEntry; error?: string }> {
    if (!colorName || typeof colorName !== 'string') {
      return { success: false, error: 'Invalid color name provided' };
    }

    const colorIndex = this.colors.findIndex(
      color => color.name.toLowerCase() === colorName.toLowerCase().trim()
    );

    if (colorIndex === -1) {
      return { 
        success: false, 
        error: `Color '${colorName}' not found. Available colors: ${this.getAvailableColorNames().join(', ')}` 
      };
    }

    try {
      this.currentColorIndex = colorIndex;
      const currentColor = this.getCurrentColor();
      
      await this._updateIconColor(currentColor.value);
      
      return { 
        success: true, 
        color: currentColor 
      };
    } catch (error) {
      return this._createErrorResult('Error setting color by name', error as Error);
    }
  }

  async setCustomColor(hexColor: string, name: string = 'Custom'): Promise<{ success: boolean; color?: ColorEntry; error?: string }> {
    if (!this._isValidHexColor(hexColor)) {
      return { success: false, error: 'Invalid hex color format' };
    }

    try {
      await this._updateIconColor(hexColor);
      
      const customColor: ColorEntry = { value: hexColor, name };
      return { success: true, color: customColor };
    } catch (error) {
      return this._createErrorResult('Error setting custom color', error as Error);
    }
  }

  getCurrentColor(): ColorEntry {
    return { ...this.colors[this.currentColorIndex] };
  }

  getCurrentColorName(): string {
    return this.getCurrentColor().name;
  }

  getAvailableColors(): ColorEntry[] {
    return this.colors.map(color => ({ ...color }));
  }

  getAvailableColorNames(): string[] {
    return this.colors.map(color => color.name);
  }

  hasColor(colorName: string): boolean {
    return this.colors.some(
      color => color.name.toLowerCase() === colorName.toLowerCase().trim()
    );
  }

  getStatus(): { currentColor: string; currentValue: string | null; totalColors: number; availableColors: string[]; currentIndex: number } {
    const currentColor = this.getCurrentColor();
    return {
      currentColor: currentColor.name,
      currentValue: currentColor.value,
      totalColors: this.colors.length,
      availableColors: this.getAvailableColorNames(),
      currentIndex: this.currentColorIndex
    };
  }

  getActualVSCodeColor(): string | null {
    try {
      const config = vscode.workspace.getConfiguration();
      const customizations = config.get<Record<string, string>>(ColorManager.CONFIG.WORKBENCH_KEY, {});
      return customizations[ColorManager.CONFIG.ICON_KEY] || null;
    } catch (error) {
      console.error('Error getting actual VS Code color:', error);
      return null;
    }
  }

  private async _updateIconColor(colorValue: string | null): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const customizations = { ...config.get<Record<string, string>>(ColorManager.CONFIG.WORKBENCH_KEY, {}) };

    if (colorValue === null) {
      delete customizations[ColorManager.CONFIG.ICON_KEY];
    } else {
      customizations[ColorManager.CONFIG.ICON_KEY] = colorValue;
    }

    await config.update(
      ColorManager.CONFIG.WORKBENCH_KEY,
      Object.keys(customizations).length ? customizations : undefined,
      ColorManager.CONFIG.TARGET
    );
  }

  private _createErrorResult(message: string, error: Error): { success: boolean; error: string } {
    const errorMessage = `${message}: ${error.message}`;
    console.error(errorMessage, error);
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }

  private _isValidHexColor(color: string): boolean {
    return typeof color === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(color);
  }
}
