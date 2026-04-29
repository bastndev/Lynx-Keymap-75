import * as vscode from 'vscode';

export class TerminalManager {
  private isTerminalLeftMode = false;

  public registerCommands(context: vscode.ExtensionContext) {
    const toggleTerminalLeftDisposable = vscode.commands.registerCommand(
      'lynx-keymap.toggleTerminalLeft',
      async () => {
        if (!this.isTerminalLeftMode) {
          // === MODO: TERMINAL A LA IZQUIERDA ===
          
          // 1. Asegurar que el terminal se abra y se enfoque
          await vscode.commands.executeCommand('workbench.action.terminal.focus');
          
          // 2. Mover el panel al lado izquierdo
          await vscode.commands.executeCommand('workbench.action.positionPanelLeft');
          
          // 3. Cerrar el chat de AI (presionando el atajo)
          await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
          
          this.isTerminalLeftMode = true;
        } else {
          // === MODO: AI CHAT ===
          
          // 1. Cerrar el panel (donde se encuentra el terminal)
          await vscode.commands.executeCommand('workbench.action.closePanel');
          
          // 2. Abrir el chat de AI
          await vscode.commands.executeCommand('lynx-keymap.openAndCloseAIChat');
          
          this.isTerminalLeftMode = false;
        }
      }
    );

    context.subscriptions.push(toggleTerminalLeftDisposable);
  }
}