import * as vscode from 'vscode';
import { AI_COMMANDS, EDITOR_PRIMARY_SETTING, EditorType } from './configs';
import { EditorDetector } from './detector';
import { STORAGE_KEYS, LOG_PREFIX } from '../../shared/constants';
import { BaseManager } from '../../shared/base-manager';
import { tryExecuteCommand } from '../../shared/commands';
import { notifyToggle } from '../../notifications/toggle';

const ALL_AI_SETTINGS = [
  'antigravity.tab.enabled',
  'editor.inlineSuggest.enabled',
  'github.copilot.editor.enableAutoCompletions',
  'kiro.completions.enabled',
  'cursor.completions.enabled',
  'trae.autocomplete.enabled',
  'cloudcode.duetAI.completions.enabled',
];

export class AIToggleManager extends BaseManager {
  constructor(private readonly detector: EditorDetector) {
    super();
  }

  public registerCommands(context: vscode.ExtensionContext): void {
    const toggleCmd = vscode.commands.registerCommand('lynx.toggleSuggestionAI', async () => {
      await this.toggleAI(context);
    });
    this.register(context, toggleCmd);
  }

  private async toggleAI(context: vscode.ExtensionContext): Promise<void> {
    const editor = await this.detector.detect();

    const storedState  = context.globalState.get<boolean>(STORAGE_KEYS.SUGGESTIONS_ENABLED);
    const config       = vscode.workspace.getConfiguration();
    const currentState = storedState ?? config.get<boolean>(EDITOR_PRIMARY_SETTING[editor], true);
    const newState     = !currentState;

    await context.globalState.update(STORAGE_KEYS.SUGGESTIONS_ENABLED, newState);
    await this.applyAllSettings(newState);
    await this.applyEditorCommands(editor);

    void notifyToggle(editor, newState);
  }

  private async applyAllSettings(newState: boolean): Promise<void> {
    const config = vscode.workspace.getConfiguration();

    for (const setting of ALL_AI_SETTINGS) {
      try {
        if (config.has(setting) || setting === 'editor.inlineSuggest.enabled') {
          await config.update(setting, newState, vscode.ConfigurationTarget.Global);
        }
      } catch (e) {
        console.error(`${LOG_PREFIX} Failed to update "${setting}":`, e);
      }
    }
  }

  private async applyEditorCommands(editor: EditorType): Promise<void> {
    const cmd = AI_COMMANDS.toggleSuggestionAI[editor];
    if (cmd) {
      void tryExecuteCommand(cmd, false);
    }
  }
}
