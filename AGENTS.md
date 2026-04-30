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
- Format: `cjs`, platform: `node`, external: `vscode`.
- Production flag: `--production` (minifies, drops sourcemaps). Watch flag: `--watch`.
- `vscode:prepublish` hooks `bun run package` for marketplace publish.

## Architecture

```
src/extension.ts
├── keymaps/ai/ai-handler.ts     # AICommandsManager — editor detection + fallback execution
│   └── utils.ts                 # EDITOR_SIGNATURES + AI_COMMANDS maps (source of truth)
├── keymaps/terminal/terminal.ts # TerminalManager — panel toggle with side-switch
├── notifications/extension-checker.ts      # Optional ext check (F1-Quick Switch, GitLab)
└── notifications/smart-checker-webview.ts  # Webview ext check (Compare Code)
```

- **Dead code**: `src/keymaps/keymaps.ts`, `src/keymaps/terminal/macros.ts` are empty. `SwapManager` (`src/keymaps/swap.ts`) is commented out in `extension.ts`.
- **ARCHITECTURE.md is stale** — references files that do not exist (e.g., `ai-keymap-config.ts`, `swap.ts`). Trust the `src/` tree, not the diagram.

## Adding or Modifying AI Commands

1. Update `src/keymaps/ai/utils.ts`:
   - `EDITOR_SIGNATURES` for new editor detection
   - `AI_COMMANDS` for the command mapping
   - `ActionKey` union if adding a new action
   - `KEYMAP_CONFIG` to wire the VS Code command ID
2. Add keybinding + command declaration in `package.json` (`contributes.keybindings` and `contributes.commands`).
3. `AICommandsManager` auto-detects editor on first keypress and tries fallback editors if the primary command fails.

## Extension Dependency Checks

- `ExtensionChecker` and `SmartWebviewExtension` guard commands that require companion extensions. If missing, they prompt the user to install from the marketplace.
- Mapped extensions:
  - `bastndev.f1` (F1-Quick Switch)
  - `bastndev.atm` (GitLab)
  - `bastndev.compare-code` (Compare Code)

## Style & Lint

- ESLint config in `eslint.config.mjs` (flat config). Rules: `curly`, `eqeqeq`, `no-throw-literal`, `semi`, plus `@typescript-eslint/naming-convention` for imports.
- TypeScript: strict, `Node16` module resolution, `ES2022`, rootDir `src`.

## Publishing Notes

- Version and publisher are set in `package.json` (`version`, `publisher: bastndev`).
- Icon and gallery assets live in `assets/`.
- `.vscodeignore` is minimal; ensure secrets and build artifacts are not packed.
