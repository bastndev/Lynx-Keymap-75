import * as vscode from 'vscode';
import { EditorType, EDITOR_SIGNATURES } from './utils';

/** Primary setting used as the state source of truth per editor. */
const EDITOR_PRIMARY_SETTING: Record<EditorType, string> = {
  [EditorType.ANTIGRAVITY]: 'antigravity.tab.enabled',
  [EditorType.VSCODE]:      'editor.inlineSuggest.enabled',
  [EditorType.KIRO]:        'kiro.completions.enabled',
  [EditorType.CURSOR]:      'cursor.completions.enabled',
  [EditorType.WINDSURF]:    'editor.inlineSuggest.enabled',
  [EditorType.TRAE_AI]:     'trae.autocomplete.enabled',
  [EditorType.FIREBASE]:    'cloudcode.duetAI.completions.enabled',
  [EditorType.UNKNOWN]:     'editor.inlineSuggest.enabled',
};

export class AIToggleManager {
  private disposables: vscode.Disposable[] = [];
  private detectedEditor: EditorType | null = null;

  public registerCommands(context: vscode.ExtensionContext): void {
    const toggleCmd = vscode.commands.registerCommand('lynx.toggleSuggestionAI', async () => {
      await this.toggleAI(context);
    });

    this.disposables.push(toggleCmd);
    context.subscriptions.push(toggleCmd);
  }

  private async toggleAI(context: vscode.ExtensionContext): Promise<void> {
    const editor = await this.detectEditor();

    // Use stored state first to survive command-only toggles; fall back to config.
    const storedState  = context.globalState.get<boolean>('lynx.suggestionsEnabled');
    const config       = vscode.workspace.getConfiguration();
    const currentState = storedState ?? config.get<boolean>(EDITOR_PRIMARY_SETTING[editor], true);
    const newState     = !currentState;

    await context.globalState.update('lynx.suggestionsEnabled', newState);
    await this.applyAllSettings(newState);
    await this.applyEditorCommands(editor, newState);

    this.notify(editor, newState);
  }

  /** Updates all known AI suggestion settings to newState. Skips absent settings. */
  private async applyAllSettings(newState: boolean): Promise<void> {
    const config = vscode.workspace.getConfiguration();

    const booleanSettings = [
      // ── Antigravity ───────────────────────────────────────────
      'antigravity.tab.enabled',

      // ── VS Code base ──────────────────────────────────────────
      'editor.inlineSuggest.enabled',

      // ── GitHub (Copilot) ────────────────────────────────────────
      'github.copilot.editor.enableAutoCompletions',

      // ── Kiro (AWS) ────────────────────────────────────────────
      'kiro.completions.enabled',

      // ── Cursor ────────────────────────────────────────────────
      'cursor.completions.enabled',

      // ── Windsurf (Codeium) — per-language object, not a boolean; command handles it.

      // ── Trae AI ───────────────────────────────────────────────
      'trae.autocomplete.enabled',

      // ── Firebase / Gemini Code Assist ─────────────────────────
      'cloudcode.duetAI.completions.enabled',
    ];

    for (const setting of booleanSettings) {
      try {
        if (config.has(setting) || setting === 'editor.inlineSuggest.enabled') {
          await config.update(setting, newState, vscode.ConfigurationTarget.Global);
        }
      } catch (e) {
        console.error(`[Lynx] Failed to update "${setting}":`, e);
      }
    }
  }

  /** Fires editor-specific commands for cases where settings alone are insufficient. */
  private async applyEditorCommands(editor: EditorType, newState: boolean): Promise<void> {
    switch (editor) {
      case EditorType.VSCODE:
        await this.safeExecute('github.copilot.chat.completions.toggle');
        break;

      case EditorType.CURSOR:
        await this.safeExecute('cursor.toggleCopilot');
        break;

      case EditorType.WINDSURF:
        // codeium.toggleEnable is required; config is per-language, not a boolean.
        await this.safeExecute('codeium.toggleEnable');
        break;

      case EditorType.TRAE_AI:
        await this.safeExecute('trae.toggleAutocomplete');
        break;

      case EditorType.FIREBASE:
        await this.safeExecute('cloudcode.duetAI.toggleInlineCompletion');
        break;
    }
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