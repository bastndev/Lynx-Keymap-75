import * as vscode from 'vscode';
import { EditorType, EDITOR_SIGNATURES } from './utils';

export class AIToggleManager {
  private disposables: vscode.Disposable[] = [];
  private detectedEditor: EditorType | null = null;

  public registerCommands(context: vscode.ExtensionContext): void {
    const toggleCmd = vscode.commands.registerCommand('lynx.toggleSuggestionAI', async () => {
      await this.toggleAI();
    });

    this.disposables.push(toggleCmd);
    context.subscriptions.push(toggleCmd);
  }

  private async toggleAI(): Promise<void> {
    const editor = await this.detectEditor();
    let isNowEnabled = false;
    
    switch (editor) {
      case EditorType.CURSOR:
        try {
          const config = vscode.workspace.getConfiguration();
          const currentlyEnabled = config.get('editor.inlineSuggest.enabled', true);
          if (currentlyEnabled) {
            await vscode.commands.executeCommand('editor.cpp.disableenabled');
            isNowEnabled = false;
          } else {
            await vscode.commands.executeCommand('editor.action.enableCppGlobally');
            isNowEnabled = true;
          }
        } catch {
          // Fallback if Cursor internal commands fail
          isNowEnabled = await this.toggleGenericInlineSuggest();
        }
        break;

      case EditorType.WINDSURF:
        await this.safeExecute('windsurf.prioritized.supercompleteEscape');
        isNowEnabled = await this.getInlineSuggestState();
        break;

      case EditorType.TRAE_AI:
        await this.safeExecute('trae.tab.enableSmartEdit');
        isNowEnabled = await this.getInlineSuggestState();
        break;

      default:
        // For VS Code (Copilot) and others, toggle inlineSuggest
        isNowEnabled = await this.toggleGenericInlineSuggest();
        break;
    }

    this.notify(editor, isNowEnabled);
  }

  private async toggleGenericInlineSuggest(): Promise<boolean> {
    const config = vscode.workspace.getConfiguration();
    const currentState = config.get('editor.inlineSuggest.enabled', true);
    const newState = !currentState;
    await config.update('editor.inlineSuggest.enabled', newState, vscode.ConfigurationTarget.Global);
    await this.safeExecute('github.copilot.toggleInlineSuggestion');
    return newState;
  }

  private getInlineSuggestState(): boolean {
    return vscode.workspace.getConfiguration().get('editor.inlineSuggest.enabled', true);
  }

  private notify(editor: EditorType, enabled: boolean): void {
    const check = enabled ? '✅' : '❌';
    const label = enabled ? 'ENABLED' : 'DISABLED';
    const name  = editor.charAt(0).toUpperCase() + editor.slice(1);
    
    vscode.window.showInformationMessage(`(${name}) AI: ${label} ${check}`);
  }

  private async safeExecute(command: string): Promise<boolean> {
    try {
      await vscode.commands.executeCommand(command);
      return true;
    } catch {
      return false;
    }
  }

  private async detectEditor(): Promise<EditorType> {
    if (this.detectedEditor) {return this.detectedEditor;}

    const allCommands = await vscode.commands.getCommands(true);
    const DETECTION_ORDER = [
      EditorType.ANTIGRAVITY,
      EditorType.WINDSURF,
      EditorType.CURSOR,
      EditorType.TRAE_AI,
      EditorType.KIRO,
      EditorType.FIREBASE,
      EditorType.VSCODE,
    ];

    for (const editor of DETECTION_ORDER) {
      const signatures = EDITOR_SIGNATURES[editor];
      if (signatures.some(sig => allCommands.includes(sig))) {
        this.detectedEditor = editor;
        return editor;
      }
    }

    this.detectedEditor = EditorType.VSCODE;
    return EditorType.VSCODE;
  }

  public dispose(): void {
    this.disposables.forEach(d => d.dispose());
  }
}
