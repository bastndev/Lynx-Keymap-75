# Lynx Keymap 75% — Agent Notes

## Build Commands
| Task | Command |
|------|---------|
| Dev | `bun run compile` |
| Prod | `bun run package` |
| Watch | `bun run watch` |
| Typecheck | `bun run check-types` |
| Lint | `bun run lint` |
| Launch | F5 (VS Code) |

> Bun only. Lockfile: `bun.lock`. No tests.

## Build
- Entry: `src/extension.ts` → `dist/extension.js` (esbuild)
- Format: cjs, platform: node
- Externals: `vscode`, `NeteaseCloudMusicApi` (dead ref)
- Flags: `--production` (minify), `--watch`
- Publish: `vscode:prepublish` → `bun run package`

## Structure
```
src/
├── extension.ts         # Entry point
├── utils/
│   ├── constants.ts    # COMMAND_IDS, EXTENSION_DEPENDENCIES, STORAGE_KEYS
│   └── timeout-manager.ts
├── keymaps/
│   ├── ai/
│   │   ├── ai-handler.ts  # Editor detection + fallback
│   │   └── utils.ts       # KEYMAP_CONFIG source of truth
│   ├── terminal/
│   │   ├── shared.ts      # Save/restore terminal settings
│   │   ├── left-right.ts # Toggle panel left/right
│   │   └── bottom.ts     # Toggle panel to bottom
│   └── plus/
│       ├── markdown.ts      # Markdown word wrap (F1)
│       └── disable-enable-ai.ts # Toggle AI suggestions (Shift+F1)
└── notifications/
    ├── extension-checker.ts   # Guard: bastndev.f1, bastndev.atm
    └── smart-checker-webview.ts # Guard: bastndev.compare-code
```

## AI Commands
1. Edit `src/keymaps/ai/utils.ts`: `EDITOR_SIGNATURES`, `AI_COMMANDS`, `ActionKey`, `KEYMAP_CONFIG`
2. Add keybinding + command in `package.json`
3. Auto-detect: Antigravity → Windsurf → Cursor → Trae → Kiro → Firebase → VSCode

## Dependencies
| Extension | Trigger |
|-----------|----------|
| bastndev.f1 (F1-Quick Switch) | `Ctrl+4` |
| bastndev.atm (GitLab) | `Ctrl+Q` |
| bastndev.compare-code (Compare Code) | `Shift+Alt+\` |

Config: `src/utils/constants.ts` → `EXTENSION_DEPENDENCIES`, `WEBVIEW_EXTENSIONS`

## Lint & Types
- ESLint: flat config (`eslint.config.mjs`)
- TypeScript: strict, `Node16`, ES2022, rootDir `src`

## Publish
- Version/publisher: `package.json`
- Assets: `assets/`
- `.vscodeignore`: minimal