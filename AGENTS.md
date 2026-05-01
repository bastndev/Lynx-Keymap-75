# Lynx Keymap 75% — Agent Notes

## Quick Commands

| Task               | Command                                           |
| ------------------ | ------------------------------------------------- |
| Build (dev)        | `bun run compile`                                 |
| Build (production) | `bun run package`                                 |
| Watch              | `bun run watch`                                   |
| Type check         | `bun run check-types`                             |
| Lint               | `bun run lint`                                    |
| Launch extension   | F5 in VS Code (runs `bun-compile` prelaunch task) |

- **Package manager**: Bun (lockfile is `bun.lock`). Do not use `npm`/`pnpm`/`yarn`.
- **No tests** in this repo. Verification = lint + typecheck + manual launch.

## Build & Bundling

- Entry: `src/extension.ts` → `dist/extension.js` via `esbuild.js`.
- Format: `cjs`, platform: `node`, external: `vscode`, `NeteaseCloudMusicApi`.
- Production flag: `--production` (minifies, drops sourcemaps). Watch flag: `--watch`.
- `vscode:prepublish` hooks `bun run package` for marketplace publish.

## Architecture

```
src/extension.ts                         # Main entry — activates all managers
├── utils/
│   ├── constants.ts                     # COMMAND_IDS, EXTENSION_DEPENDENCIES, WEBVIEW_EXTENSIONS, STORAGE_KEYS
│   └── timeout-manager.ts             # Utility: capped timeout pool with cleanup
├── keymaps/
│   ├── ai/
│   │   ├── ai-handler.ts              # AICommandsManager — editor detection + fallback execution
│   │   └── utils.ts                   # EDITOR_SIGNATURES + AI_COMMANDS + KEYMAP_CONFIG (source of truth)
│   ├── terminal/
│   │   ├── shared.ts                  # Shared terminal settings save/restore (used by both managers)
│   │   ├── left-right.ts             # TerminalManager — panel toggle to left/right side
│   │   └── bottom.ts                 # BottomTerminalManager — panel toggle to bottom
│   └── plus/
│       ├── markdown.ts               # MarkdownManager — toggles markdown word wrap (F1)
│       └── disable-enable-ai.ts      # AIToggleManager — toggles AI suggestions (Shift+F1)
└── notifications/
    ├── extension-checker.ts          # ExtensionChecker — guards F1-Quick Switch, GitLab commands
    └── smart-checker-webview.ts      # SmartWebviewExtension — guards Compare Code webview command
```

- **ARCHITECTURE.md is stale** — references files that do not exist (e.g., `ai-keymap-config.ts`, `swap.ts`). Trust the `src/` tree, not the diagram.

## Adding or Modifying AI Commands

1. Update `src/keymaps/ai/utils.ts`:
   - `EDITOR_SIGNATURES` for new editor detection
   - `AI_COMMANDS` for the command mapping
   - `ActionKey` union if adding a new action
   - `KEYMAP_CONFIG` to wire the VS Code command ID
2. Add keybinding + command declaration in `package.json` (`contributes.keybindings` and `contributes.commands`).
3. `AICommandsManager` auto-detects editor on first keypress and tries fallback editors if the primary command fails.
4. Detection order: Antigravity → Windsurf → Cursor → Trae → Kiro → Firebase → VSCode (fallback).

## Extension Dependency Checks

- `ExtensionChecker` and `SmartWebviewExtension` guard commands that require companion extensions. If missing, they prompt the user to install from the marketplace.
- Mapped extensions:
  - `bastndev.f1` (F1-Quick Switch) — triggered by `Ctrl+4`
  - `bastndev.atm` (GitLab) — triggered by `Ctrl+Q`
  - `bastndev.compare-code` (Compare Code) — triggered by `Shift+Alt+\`
- Dependency config lives in `src/utils/constants.ts` (`EXTENSION_DEPENDENCIES`, `WEBVIEW_EXTENSIONS`).

## Style & Lint

- ESLint flat config (`eslint.config.mjs`). Rules: `curly`, `eqeqeq`, `no-throw-literal`, `semi`, plus `@typescript-eslint/naming-convention` for imports.
- TypeScript: strict, `Node16` module resolution, `ES2022`, rootDir `src`. DOM lib included for type-checking.

## Publishing Notes

- Version and publisher are set in `package.json` (`version`, `publisher: bastndev`).
- Icon and gallery assets live in `assets/`.
- `.vscodeignore` is minimal (excludes `.vscode/**`, `.gitignore`).
- `esbuild.js` externalizes `vscode` and `NeteaseCloudMusicApi` — the latter is a dead reference from an old webview build that's commented out.
