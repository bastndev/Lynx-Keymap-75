import * as vscode from 'vscode';
import { EditorDetector }              from './keymaps/ai/detector';
import { AICommandsManager }           from './keymaps/ai/commands-manager';
import { AIToggleManager }             from './keymaps/ai/toggle-manager';
import { TerminalManager }             from './keymaps/terminal/side-panel';
import { BottomTerminalManager }       from './keymaps/terminal/bottom-panel';
import { DebugManager }                from './debug/panel';
import { WordWrapManager }             from './wordwrap/manager';
import { recoverSidePanelState }       from './keymaps/terminal/startup-recovery';
import { promptInstallExtension }      from './notifications/install-prompt';

const managers: Array<{ name: string; ref: vscode.Disposable | undefined }> = [];

export async function activate(context: vscode.ExtensionContext) {
  const detector           = new EditorDetector();
  const aiManager          = new AICommandsManager(detector);
  const aiToggleManager    = new AIToggleManager(detector);
  const terminalManager    = new TerminalManager();
  const bottomTerminalMgr  = new BottomTerminalManager();
  const wordWrapManager    = new WordWrapManager();
  const debugManager       = new DebugManager();

  managers.push(
    { name: 'aiManager',         ref: aiManager         },
    { name: 'aiToggleManager',   ref: aiToggleManager   },
    { name: 'terminalManager',   ref: terminalManager   },
    { name: 'bottomTerminalMgr', ref: bottomTerminalMgr },
    { name: 'wordWrapManager',   ref: wordWrapManager   },
    { name: 'debugManager',      ref: debugManager      },
  );

  aiManager.registerCommands(context);
  aiToggleManager.registerCommands(context);
  terminalManager.registerCommands(context);
  bottomTerminalMgr.registerCommands(context);
  wordWrapManager.registerCommands(context);
  debugManager.registerCommands(context);

  void aiManager.warmup().catch(error => {
    console.warn(`[lynx-keymap] AI detection warmup failed:`, error);
  });

  // ─── Panel commands (GitLab + MySkills) ────────────────────────────────────
  const panelCommands: Array<{ cmd: string; extId: string; focusCmd: string }> = [
    { cmd: 'lynx-keymap.openGitlabPanel',   extId: 'bastndev.atm',       focusCmd: 'workbench.view.extension.gitlab-panel' },
    { cmd: 'lynx-keymap.openMySkillsPanel',  extId: 'bastndev.my-skills', focusCmd: 'myskills-panel.focus' },
  ];

  for (const { cmd, extId, focusCmd } of panelCommands) {
    const disposable = vscode.commands.registerCommand(cmd, async () => {
      const ext = vscode.extensions.getExtension(extId);
      if (ext) {
        if (!ext.isActive) { await ext.activate(); }
        void vscode.commands.executeCommand(focusCmd);
      } else {
        void promptInstallExtension(extId);
      }
    });
    context.subscriptions.push(disposable);
  }

  // ─── Startup recovery ──────────────────────────────────────────────────────
  await recoverSidePanelState(context);
}

export function deactivate(): void {
  for (const { name, ref } of managers) {
    try {
      ref?.dispose();
    } catch (error) {
      console.error(`[lynx-keymap] Error disposing ${name}:`, error);
    }
  }
}
