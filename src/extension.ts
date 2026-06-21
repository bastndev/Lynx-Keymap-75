import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showWarningMessage('⚠️ Lynx Keymap 75 ha sido fusionada con Lynx Keymap Pro. Esta extensión será eliminada pronto. Por favor, desinstálala.', 'Ver Lynx Keymap Pro').then(selection => {
        if (selection === 'Ver Lynx Keymap Pro') {
            vscode.env.openExternal(vscode.Uri.parse('vscode:extension/bastndev.lynx-keymap'));
        }
    });
}