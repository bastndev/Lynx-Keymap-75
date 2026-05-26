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
| `EditorDetector` | `src/keymaps/ai/detector.ts` | Detects active editor (Priority: Antigravity → Windsurf → Cursor → Trae → Kiro → Firebase → VSCode). Caches result for 5 min. Shared by AI managers. |
| `AICommandsManager` | `src/keymaps/ai/commands-manager.ts` | Executes AI commands using primary + fallback strategy via `EditorDetector`. |
| `AIToggleManager` | `src/keymaps/ai/toggle-manager.ts` | Toggles AI suggestions across multiple providers by updating global configurations. |
| `TerminalManager` | `src/keymaps/terminal/side-panel.ts` | Handles the lateral terminal (Left/Right) including settings persistence. |
| `BottomTerminalManager` | `src/keymaps/terminal/bottom-panel.ts` | Handles the bottom terminal toggle. |
| `WordWrapManager` | `src/wordwrap/manager.ts` | Handles intelligent word-wrap toggling across supported languages. |
| `DebugManager` | `src/debug/panel.ts` | Anchors panels and starts debugging strictly from bottom terminal layout. |
| `PanelCommandsManager` | `src/notifications/panels/commands.ts` | Registers external panel commands (GitLab, MySkills) with install prompts. |

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
  extension.ts                  # Entry point (lifecycle only)
  shared/
    constants.ts                # LOG_PREFIX, STORAGE_KEYS, PANEL_POSITIONS
    base-manager.ts             # BaseManager abstract (disposable pattern)
    commands.ts                 # tryExecuteCommand() shared utility
  keymaps/
    index.ts                    # Barrel re-exports
    ai/
      configs.ts                # AI Command maps and editor signatures (pure data)
      detector.ts               # EditorDetector (detection + cache)
      commands-manager.ts       # AICommandsManager
      toggle-manager.ts         # AIToggleManager
    terminal/
      constants.ts              # TERMINAL_CONFIG, WORKBENCH_CONFIG, LAYOUT_SETTLE_MS
      settings.ts               # save/apply/restore original settings
      side-panel.ts             # Lateral terminal logic
      bottom-panel.ts           # Bottom terminal logic
      startup-recovery.ts       # Auxiliary bar cleanup on startup
  debug/
    panel.ts                    # Smart debug start logic
  wordwrap/
    manager.ts                  # Word-wrap toggle logic
  notifications/
    i18n.ts                     # Translation loader (getTranslation)
    toggle.ts                   # notifyToggle helper
    install-prompt.ts           # Generic extension install prompt
    panels/
      commands.ts               # External panel commands (GitLab, MySkills)
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
