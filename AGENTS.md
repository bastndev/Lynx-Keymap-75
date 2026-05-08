# Lynx Keymap 75% — Agent Notes

## Project type

VS Code extension (keymap + AI integration). Written in **TypeScript**, bundled with **esbuild**, and managed with **Bun**.

## Commands

- **Debug**: `F5` opens a new VS Code window with the extension loaded.
- **Build**: `bun run compile` (runs `esbuild.js`).
- **Watch**: `bun run watch` (rebuilds automatically on change).
- **Format**: `npx prettier --write .`.
- **Lint**: `bun run lint` (ESLint).
- **Package**: `npx vsce package` (requires `bun run package` first to generate `dist/`).

## Architecture

Entry point: `src/extension.ts` — `activate()` instantiates managers and registers commands.

| Manager | File | Responsibility |
|---------|------|----------------|
| `AICommandsManager` | `src/keymaps/ai/controller.ts` | Detects active editor (Priority: Antigravity → Windsurf → Cursor → Trae → Kiro → Firebase → VSCode) and executes corresponding AI commands. |
| `AIToggleManager` | `src/keymaps/ai/controller.ts` | Toggles AI suggestions across multiple providers by updating global configurations. |
| `TerminalManager` | `src/keymaps/terminal/side-panel.ts` | Handles the lateral terminal (Left/Right) including settings persistence. |
| `BottomTerminalManager` | `src/keymaps/terminal/bottom-panel.ts` | Handles the bottom terminal toggle. |
| `WordWrapManager` | `src/keymaps/shared/wordwrap.ts` | Handles intelligent word-wrap toggling across supported languages. |
| `DebugManager` | `src/keymaps/shared/debug/panel.ts` | Anchors panels and starts debugging strictly from bottom terminal layout. |

## Key gotchas

- **TypeScript Build**: You MUST run `bun run watch` or `bun run compile` for changes to take effect in the debug window. The entry point in `package.json` points to `dist/extension.js`.
- **AI Detection**: Priority-based fallback. Detection is cached for 5 minutes (`CACHE_EXPIRY`). Use `resetDetection()` to force a refresh.
- **Settings Persistence**: The extension saves original user settings (tabs, panel labels) before applying its own layout, and restores them when closing custom panels.
- **No test suite exists**: Verify changes manually by running F5 and testing affected keybindings in the host editor.
- **Keybindings**: Defined in `package.json`. Commands registered in `extension.ts` MUST match the command IDs in `package.json`.
- **README Differentiation**: The main `README.md` uses an image for the Experimental section title (`![Experimental — New](...)`), whereas the localized READMEs in `public/docs/` use text headers (e.g., `## 🧪 Funciones Experimentales — Nuevo`). This is intentional to distinguish the primary documentation.

## Directory structure

```
src/
  extension.ts              # Entry point
  keymaps/
    index.ts                # Main exports
    ai/
      controller.ts         # AICommandsManager & AIToggleManager
      configs.ts            # AI Command maps and editor signatures
    terminal/
      side-panel.ts         # Lateral terminal logic
      bottom-panel.ts       # Bottom terminal logic
      shared.ts             # Common terminal settings & helpers
    shared/
      wordwrap.ts           # Word-wrap toggle logic
      debug/
        panel.ts            # Smart debug start logic
  notifications/
    info.ts                 # Notification helpers
    with-buttons.ts         # Actionable notifications
  shared/
    constants.ts            # Constants definitions
```

## Required External Extensions
| Extension | ID | Shortcut |
|-----------|-----|----------|
| F1-Quick Switch | `bastndev.f1` | `Ctrl+4` |
| GitLab | `bastndev.atm` | `Ctrl+Q` |
| Compare Code | `bastndev.compare-code` | `Shift+Alt+\` |

## Related files

- `package.json` — Keybindings, commands, and extension metadata.
- `esbuild.js` — Build configuration.
