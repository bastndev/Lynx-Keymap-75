import * as vscode from 'vscode';

export async function promptInstallAtmExtension() {
    const installAction = '📥 Descargar e Instalar ATM';

    const selection = await vscode.window.showInformationMessage(
        'Para usar el panel de GitLab, necesitas instalar la extensión "ATM" (@gohitx).',
        installAction
    );

    if (selection === installAction) {
        vscode.commands.executeCommand('workbench.extensions.installExtension', 'bastndev.atm');
    }
}
