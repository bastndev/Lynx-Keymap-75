import * as vscode from 'vscode';
import { AICommandsManager } from './ai-keymap-handler';
import { EditorType } from './ai-keymap-config';

/**
 * SwapManager
 * Detects the active editor and sets VS Code contexts so that keybindings in package.json
 * can be conditionally enabled/disabled using "when" clauses.
 */
export class SwapManager {
  private aiManager: AICommandsManager;

  constructor(aiManager: AICommandsManager) {
    this.aiManager = aiManager;
  }

  /**
   * Detects the environment and sets the 'lynx-keymap.isAntigravity' context.
   */
  public async initializeContexts() {
    const editor = await this.aiManager.detectEditor();
    const isAntigravity = editor === EditorType.ANTIGRAVITY;
    
    await vscode.commands.executeCommand('setContext', 'lynx-keymap.isAntigravity', isAntigravity);
    console.log(`[lynx-keymap] SwapManager initialized. isAntigravity Context: ${isAntigravity}`);
  }
}
