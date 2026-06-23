import * as vscode from 'vscode';

const NEW_EXTENSION_ID = 'bastndev.lynx-keymap';
const OLD_EXTENSION_ID = 'bastndev.lynx-keymap-75';
const SHOWN_KEY = 'lynxKeymap75.deprecationNoticeShown';

export async function activate(context: vscode.ExtensionContext) {
    if (context.globalState.get<boolean>(SHOWN_KEY)) {
        return;
    }

    const hasPro = !!vscode.extensions.getExtension(NEW_EXTENSION_ID);

    const message = hasPro
        ? '⚠️ Lynx Keymap 75 is deprecated. Lynx Keymap Pro is already installed — please uninstall this old version to avoid shortcut conflicts. Press Alt+0 inside Pro to switch to 75% mode.'
        : '⚠️ Lynx Keymap 75 has merged into Lynx Keymap Pro. Install Pro, then press Alt+0 to switch to 75% mode, and uninstall this old version.';

    const installLabel = 'Install Lynx Keymap Pro';
    const uninstallLabel = 'Uninstall this extension';
    const dontShowLabel = "Don't show again";

    const buttons = hasPro
        ? [uninstallLabel, dontShowLabel]
        : [installLabel, uninstallLabel, dontShowLabel];

    const selection = await vscode.window.showWarningMessage(message, ...buttons);

    if (selection === installLabel) {
        await vscode.env.openExternal(
            vscode.Uri.parse(`vscode:extension/${NEW_EXTENSION_ID}`)
        );
    } else if (selection === uninstallLabel) {
        await vscode.commands.executeCommand(
            'workbench.extensions.search',
            `@installed ${OLD_EXTENSION_ID}`
        );
    } else if (selection === dontShowLabel) {
        await context.globalState.update(SHOWN_KEY, true);
    }
}
