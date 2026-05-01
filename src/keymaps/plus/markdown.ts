import * as vscode from 'vscode';

/**
 * Show notification when word wrap is toggled
 */
function showWordWrapToggleNotification(isEnabled: boolean): void {
  const emoji = isEnabled ? '✅' : '❌';
  const status = isEnabled ? 'ENABLED' : 'DISABLED';
  vscode.window.showInformationMessage(`📝 Word Wrap ${status} ${emoji}`);
}

/**
 * MarkdownManager handles markdown-related commands
 */
export class MarkdownManager {
  /**
   * Register markdown commands
   */
  registerCommands(context: vscode.ExtensionContext): void {
    const toggleMarkdownWrap = vscode.commands.registerCommand(
      'f1.toggleMarkdownWrap',
      async () => {
        const config = vscode.workspace.getConfiguration();
        
        // Get current markdown word wrap state first (this will be our reference)
        const currentSetting = config.get('[markdown]') as any;
        const currentMarkdownWrap = currentSetting?.['editor.wordWrap'] || 'off';
        const newMarkdownWrap = currentMarkdownWrap === 'off' ? 'on' : 'off';
        
        try {
          // Synchronize general word wrap
          await config.update(
            'editor.wordWrap',
            newMarkdownWrap,
            vscode.ConfigurationTarget.Global
          );

          // Update markdown specific word wrap
          await config.update(
            '[markdown]',
            {
              'editor.formatOnSave': false,
              'editor.defaultFormatter': null,
              'editor.wordWrap': newMarkdownWrap,
            },
            vscode.ConfigurationTarget.Global
          );

          showWordWrapToggleNotification(newMarkdownWrap === 'on');
        } catch (error) {
          vscode.window.showErrorMessage(`Error toggling word wrap: ${error}`);
        }
      }
    );

    context.subscriptions.push(toggleMarkdownWrap);
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    // No resources to dispose
  }
}
