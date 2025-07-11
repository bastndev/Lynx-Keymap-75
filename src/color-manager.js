const vscode = require('vscode');

class ColorManager {
    constructor() {
        this.colors = [
            '#0085c3ff', 
            '#02e14a', 
            '#e8e8e8'  
        ];
        this.currentColorIndex = 2; // Start with default color
    }

    /**
     * Cycles through available colors
     * @returns {Promise<void>}
     */
    async cycleIconColor() {
        try {
            this.currentColorIndex = (this.currentColorIndex + 1) % this.colors.length;
            const newColor = this.colors[this.currentColorIndex];
            
            const config = vscode.workspace.getConfiguration();
            
            await config.update(
                'workbench.colorCustomizations', 
                {
                    ...config.get('workbench.colorCustomizations', {}),
                    'icon.foreground': newColor
                }, 
                vscode.ConfigurationTarget.Global
            );

            const colorNames = ['Red', 'Blue', 'Default'];
            const colorName = colorNames[this.currentColorIndex];
            vscode.window.showInformationMessage(`Icon color changed to: ${colorName} (${newColor})`);
            
        } catch (error) {
            console.error('Error changing icon color:', error);
            vscode.window.showErrorMessage('Failed to change icon color. Please try again.');
        }
    }

    /**
     * Resets color to default value
     * @returns {Promise<void>}
     */
    async resetToDefault() {
        try {
            this.currentColorIndex = 2;
            const config = vscode.workspace.getConfiguration();
            const customizations = config.get('workbench.colorCustomizations', {});
            
            delete customizations['icon.foreground'];
            
            await config.update(
                'workbench.colorCustomizations', 
                customizations, 
                vscode.ConfigurationTarget.Global
            );
            
            vscode.window.showInformationMessage('Icon color reset to default');
            
        } catch (error) {
            console.error('Error resetting icon color:', error);
            vscode.window.showErrorMessage('Failed to reset icon color.');
        }
    }

    /**
     * Gets current color
     * @returns {string} Current hex color
     */
    getCurrentColor() {
        return this.colors[this.currentColorIndex];
    }

    /**
     * Gets current color name
     * @returns {string} Current color name
     */
    getCurrentColorName() {
        const colorNames = ['Red', 'Blue', 'Default'];
        return colorNames[this.currentColorIndex];
    }
}

module.exports = ColorManager;
