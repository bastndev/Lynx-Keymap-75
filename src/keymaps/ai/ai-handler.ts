import * as vscode from 'vscode';
import {
  AI_COMMANDS, KEYMAP_CONFIG, EDITOR_SIGNATURES,
  EditorType, ActionKey
} from './utils';

const LOG = '[lynx-keymap]';

export class AICommandsManager {
  private disposables: vscode.Disposable[]  = [];
  private detectedEditor: EditorType | null = null;
  private allCommandsCache: string[] | null = null;
  private cacheTimestamp: number            = 0;
  private readonly CACHE_EXPIRY             = 5 * 60 * 1000; // 5 min

  // ─── Public API ────────────────────────────────────────────────────────────

  public registerCommands(context: vscode.ExtensionContext): vscode.Disposable[] {
    const disposables = KEYMAP_CONFIG.map(({ commandId, commandsKey, errorMessage }) =>
      vscode.commands.registerCommand(commandId, async () => {
        await this.executeForAction(commandsKey, errorMessage);
      })
    );

    this.disposables = disposables;
    context.subscriptions.push(...disposables);
    return disposables;
  }

  /** Detect editor eagerly on activation so first keypress is instant */
  public async warmup(): Promise<EditorType> {
    return this.detectEditor();
  }

  /** Force re-detection (call this if user installs a new AI extension) */
  public resetDetection(): void {
    this.detectedEditor   = null;
    this.allCommandsCache = null;
    console.log(`${LOG} Detection cache cleared`);
  }

  public dispose(): void {
    this.disposables.forEach(d => d?.dispose?.());
    this.disposables = [];
  }

  // ─── Editor Detection ──────────────────────────────────────────────────────

  /**
   * Detects the active editor by checking unique command signatures.
   * Priority order: Antigravity → Windsurf → Cursor → Trae → Kiro → Firebase → VSCode
   */
  public async detectEditor(): Promise<EditorType> {
    if (this.detectedEditor) {return this.detectedEditor;}

    const allCommands = await this.getAllCommands();

    const DETECTION_ORDER: EditorType[] = [
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
      const detected   = signatures.some(sig => allCommands.includes(sig));

      if (detected) {
        this.detectedEditor = editor;
        console.log(`${LOG} Detected editor: ${editor}`);
        return editor;
      }
    }

    // Ultimate fallback
    this.detectedEditor = EditorType.VSCODE;
    console.warn(`${LOG} Editor not detected, defaulting to VSCode`);
    return this.detectedEditor;
  }

  // ─── Execution ─────────────────────────────────────────────────────────────

  private async executeForAction(actionKey: ActionKey, errorMessage: string): Promise<void> {
    const editor     = await this.detectEditor();
    const commandMap = AI_COMMANDS[actionKey];

    // 1. Try the exact command for detected editor
    const primaryCmd = commandMap[editor];
    if (primaryCmd) {
      const ok = await this.tryExecute(primaryCmd, editor);
      if (ok) {return;}

      // Primary failed → reset detection so next call re-detects
      console.warn(`${LOG} Primary command failed, resetting detection`);
      this.resetDetection();
    } else {
      console.log(`${LOG} No command mapped for ${editor} → ${actionKey}`);
    }

    // 2. Fallback: try all other editors in order
    const fallbackEditors = Object.entries(commandMap) as [EditorType, string][];
    for (const [fallbackEditor, cmd] of fallbackEditors) {
      if (fallbackEditor === editor) {continue;} // already tried

      const ok = await this.tryExecute(cmd, fallbackEditor);
      if (ok) {return;}
    }

    vscode.window.showWarningMessage(errorMessage);
  }

  /**
   * Attempts to execute a command. Returns true on success, false on failure.
   * Does NOT check the cache — executeCommand itself is the source of truth.
   */
  private async tryExecute(cmd: string, editor: EditorType | string): Promise<boolean> {
    try {
      await vscode.commands.executeCommand(cmd);
      console.log(`${LOG} ✓ [${editor}] ${cmd}`);
      return true;
    } catch {
      console.log(`${LOG} ✗ [${editor}] ${cmd}`);
      return false;
    }
  }

  // ─── Cache ─────────────────────────────────────────────────────────────────

  private async getAllCommands(): Promise<string[]> {
    const now = Date.now();
    if (this.allCommandsCache && now - this.cacheTimestamp < this.CACHE_EXPIRY) {
      return this.allCommandsCache;
    }
    try {
      this.allCommandsCache = await vscode.commands.getCommands(true);
      this.cacheTimestamp   = now;
      return this.allCommandsCache;
    } catch (error) {
      console.error(`${LOG} Failed to get commands:`, error);
      return this.allCommandsCache ?? [];
    }
  }
}