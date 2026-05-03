# Lynx Keymap 75% — Agent Notes

## Commands
| Task | Command |
|------|---------|
| Build | `bun run compile` |
| Package (prod) | `bun run package` |
| Watch | `bun run watch` |
| Typecheck | `bun run check-types` |
| Lint | `bun run lint` |

- **Runtime:** Bun (`bun.lock`). No tests.
- **Build:** esbuild → `src/extension.ts` → `dist/extension.js` (cjs, node, minified in prod). External: `vscode`.

## Actual Structure
```
src/
├── extension.ts              # Entry point — registers all managers
├── utils/
│   ├── constants.ts          # Command IDs, extension dependencies, storage keys
│   └── timeout-manager.ts    # Timeout utility with limit and cleanup
├── keymaps/
│   ├── index.ts              # Barrel export for all modules
│   ├── ai/
│   │   ├── utils.ts          # EditorType enum, EDITOR_SIGNATURES, AI_COMMANDS, KEYMAP_CONFIG
│   │   ├── ai-handler.ts     # Editor auto-detection (Antigravity→Windsurf→Cursor→Trae→Kiro→Firebase→VSCode) + fallback execution
│   │   └── toggle-handler.ts # Toggle AI suggestions (Shift+Alt+D) per detected editor
│   └── terminal/
│       ├── shared.ts         # Save/restore terminal settings (tabs, labels)
│       ├── left-right.ts     # Toggle terminal panel left/right (Alt+CapsLock)
│       └── bottom.ts         # Toggle terminal panel to bottom (Alt+E)
└── notifications/
    ├── extension-checker.ts  # Checks dependencies (F1-Quick Switch, GitLab) and installs if missing
    └── smart-checker-webview.ts # Checks and installs webview extensions (Compare Code)
```

## How to Add an AI Command
1. Add entry in `src/keymaps/ai/utils.ts` → `AI_COMMANDS` (action → per-editor command mapping)
2. Add `KEYMAP_CONFIG` entry + `command` in `package.json`
3. Add `keybinding` in `package.json`

## Required External Extensions
| Extension | ID | Shortcut |
|-----------|-----|----------|
| F1-Quick Switch | `bastndev.f1` | `Ctrl+4` |
| GitLab | `bastndev.atm` | `Ctrl+Q` |
| Compare Code | `bastndev.compare-code` | `Shift+Alt+\` |

## Active Managers
All instantiated in `activate()` and disposed in `deactivate()`:
- `AICommandsManager` — multi-editor AI commands (detect + fallback)
- `AIToggleManager` — toggle AI suggestions
- `TerminalManager` — toggle side panel
- `BottomTerminalManager` — toggle bottom panel
- `ExtensionChecker` — check/install dependencies
- `SmartWebviewExtension` — check/install external webviews
