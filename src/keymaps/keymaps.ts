import * as vscode from 'vscode';

export class KeymapsManager {
  public registerCommands(context: vscode.ExtensionContext) {
    const quickOpenTermDisposable = vscode.commands.registerCommand(
      'lynx-keymap.quickOpenTerm',
      async () => {
        try {
          // Si estamos en la terminal, primero movemos el foco al editor 
          // para que el menú de quickOpen funcione correctamente
          await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
          
          // Esperar 1 segundo para asegurar que el foco cambió correctamente
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Y luego abrimos el menú de selección
          await vscode.commands.executeCommand('workbench.action.quickOpenTerm');
        } catch (error) {
          vscode.window.showErrorMessage(`QuickOpenTerm failed: ${error}`);
        }
      }
    );

    context.subscriptions.push(quickOpenTermDisposable);
  }
}
