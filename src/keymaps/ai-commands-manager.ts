import * as vscode from 'vscode';

export default class AICommandsManager {
  private disposables: vscode.Disposable[] = [];

  // Register all AI-related commands
  public registerCommands(context: vscode.ExtensionContext): vscode.Disposable[] {
    // Command for AI commit generation MARK: [Alt+2]
    const commitDisposable = vscode.commands.registerCommand(
      'lynx-keymap.generateAICommit',
      async () => {
        const commitCommands = [
          'windsurf.generateCommitMessage',                     // 0: Windsurf
          'github.copilot.git.generateCommitMessage',           // 1: Vscode
          'cursor.generateGitCommitMessage',                    // 2: Cursor-AI
          'icube.gitGenerateCommitMessage',                     // 3: Trae-AI
          // Don't have a Firebase equivalent for this          // 4: Firebase.Studio
        ];
        await this.executeFirstAvailableCommand(commitCommands, 'No AI commit generators available');
      }
    );

    // Command for AI Popup MARK: [Ctrl+`]
    const popupDisposable = vscode.commands.registerCommand(
      'lynx-keymap.executeAIPopup',
      async () => {
        const popupCommands = [
          'windsurf.prioritized.command.open',                  // 0: Windsurf
          'inlineChat.start',                                   // 1: Vscode
          'aipopup.action.modal.generate',                      // 2: Cursor-AI
          'icube.inlineChat.start',                             // 3: Trae-AI
          'workbench.action.terminal.chat.start',               // 4: Firebase.Studio
        ];
        await this.executeFirstAvailableCommand(popupCommands, 'No AI chat providers available');
      }
    );

    // Command to open AI chat MARK: [Ctrl+tab]
    const chatDisposable = vscode.commands.registerCommand(
      'lynx-keymap.openAIChat',
      async () => {
        const chatCommands = [
          'windsurf.prioritized.chat.open',                    // 0: Windsurf
          'workbench.panel.chat',                              // 1: Vscode
          'aichat.newchataction',                              // 2: Cursor-AI
          'workbench.action.chat.icube.open',                  // 3: Trae-AI
          'aichat.prompt',                                     // 4: Firebase.Studio
        ];
        await this.executeFirstAvailableCommand(chatCommands, 'No AI chat providers available');
      }
    );

    // Command to create a new AI session MARK: [Alt+A]
    const newSessionDisposable = vscode.commands.registerCommand(
      'lynx-keymap.createNewAISession',
      async () => {
        const newSessionCommands = [
          'windsurf.prioritized.chat.openNewConversation',         // 0: Windsurf
          'workbench.action.chat.newEditSession',                  // 1: Vscode
          'composer.createNew',                                    // 2: Cursor-AI
          'workbench.action.icube.aiChatSidebar.createNewSession', // 3: Trae-AI
          // 'workbench.action.chat.newChat' NF-now                // 4: Firebase.Studio
        ];
        await this.executeFirstAvailableCommand(newSessionCommands, 'No AI providers available to create a new session');
      }
    );

    // Command to show AI history MARK: [Alt+S]
    const historyDisposable = vscode.commands.registerCommand(
      'lynx-keymap.showAIHistory',
      async () => {
        const historyCommands = [
          // ---- ---- ---- ---- --- -- -                       // 0: Windsurf
          'workbench.action.chat.history',                      // 1: Vscode
          'composer.showComposerHistory',                       // 2: Cursor-AI
          'workbench.action.icube.aiChatSidebar.showHistory',   // 3: Trae-AI
          // Firebase doesn't have a history NF-now             // 4: Firebase.Studio
        ];
        await this.executeFirstAvailableCommand(historyCommands, 'No AI history available');
      }
    );

    // Command for AI attach context [MARK: Alt+D]
    const attachContextDisposable = vscode.commands.registerCommand(
      'lynx-keymap.attachAIContext',
      async () => {
        const attachContextCommands = [
          // ---- ---- ----- --- -- -                          // 0: Windsurf
          'workbench.action.chat.attachContext',               // 1: Vscode
          'composer.openAddContextMenu',                       // 2: Cursor-AI
          // ---- ---- --- --- -- -                            // 3: Trae-AI
          // 'Workbench.action.openWorkspace' NF-now           // 4: Firebase.Studio
        ];
        await this.executeFirstAvailableCommand(
          attachContextCommands,
          'No AI context attachment available'
        );
      }
    );

    // Store all disposables
    this.disposables = [
      commitDisposable,
      popupDisposable,
      chatDisposable,
      newSessionDisposable,
      historyDisposable,
      attachContextDisposable,
    ];

    // Add to context subscriptions
    context.subscriptions.push(...this.disposables);

    return this.disposables;
  }

  // Helper function to execute the first available command from a list
  private async executeFirstAvailableCommand(commands: string[], errorMessage: string): Promise<void> {
    const allCommands = await vscode.commands.getCommands(true);
    for (const cmd of commands) {
      if (allCommands.includes(cmd)) {
        try {
          await vscode.commands.executeCommand(cmd);
          console.log(`Executed command: ${cmd}`);
          return;
        } catch (error) {
          console.error(`Error executing command ${cmd}:`, error);
        }
      } else {
        console.log(`Command not available: ${cmd}`);
      }
    }
    vscode.window.showWarningMessage(errorMessage);
  }

  // Cleanup method
  public dispose(): void {
    this.disposables.forEach((disposable) => {
      if (disposable && typeof disposable.dispose === 'function') {
        disposable.dispose();
      }
    });
    this.disposables = [];
  }
}