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
        // Cursor usa su propio setting desde ~0.40+
        isNowEnabled = await this.toggleAllAISettings();
        await this.safeExecute('cursor.toggleCopilot'); // fallback command
        break;

      case EditorType.WINDSURF:
        // Windsurf/Codeium: el comando toggle es más confiable que el setting
        await this.safeExecute('codeium.toggleEnable');
        isNowEnabled = await this.toggleAllAISettings();
        break;

      case EditorType.TRAE_AI:
        await this.safeExecute('trae.toggleAutocomplete');
        isNowEnabled = await this.toggleAllAISettings();
        break;

      default:
        isNowEnabled = await this.toggleAllAISettings();
        break;
    }

    this.notify(editor, isNowEnabled);
  }

  /**
   * Toggles ALL known AI suggestion settings.
   * Actualizado 2025: settings verificados por editor.
   */
  private async toggleAllAISettings(): Promise<boolean> {
    const config = vscode.workspace.getConfiguration();
    const currentState = config.get<boolean>('editor.inlineSuggest.enabled', true);
    const newState = !currentState;

    const booleanSettings = [
      // ── VS Code base ──────────────────────────────────────────
      'editor.inlineSuggest.enabled',

      // ── GitHub Copilot (new setting )─────────────
      'github.copilot.editor.enableAutoCompletions',

      // ── Cursor ────────────────────────────────────────────────
      'cursor.completions.enabled',

      // ── Antigravity ───────────────────────────────────────────
      'antigravity.tab.enabled',

      // ── Trae AI ───────────────────────────────────────────────
      'trae.autocomplete.enabled',

      // ── Kiro (AWS) ────────────────────────────────────────────
      'kiro.completions.enabled',
    ];

    for (const setting of booleanSettings) {
      try {
        // Solo actualiza si el setting existe en la config activa,
        // excepto el de VS Code base que siempre debe tocarse.
        if (config.has(setting) || setting === 'editor.inlineSuggest.enabled') {
          await config.update(setting, newState, vscode.ConfigurationTarget.Global);
        }
      } catch (e) {
        console.error(`[Lynx] Failed to update "${setting}":`, e);
      }
    }

    // Codeium/Windsurf usa un objeto { "*": true } por lenguaje, no un boolean.
    // Es más confiable usar el comando de toggle que el setting directo.
    if (newState === false) {
      await this.safeExecute('codeium.toggleEnable'); // toggle off
    }

    // Copilot: también intentar via comando como respaldo
    await this.safeExecute('github.copilot.toggleCopilot');

    return newState;
  }

  private notify(editor: EditorType, enabled: boolean): void {
    const icon  = enabled ? '✅' : '❌';
    const label = enabled ? 'ENABLED' : 'DISABLED';
    const name  = editor.charAt(0).toUpperCase() + editor.slice(1);
    vscode.window.showInformationMessage(`(${name}) AI Suggestions: ${label} ${icon}`);
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
    if (this.detectedEditor) { return this.detectedEditor; }

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