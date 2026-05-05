# Lynx Keymap 75% — Agent Notes

## Commands
| Task | Command |
|------|---------|
| Build | `bun run compile` |
| Package (prod) | `bun run package` |
| Watch | `bun run watch` |
| Typecheck | `bun run check-types` |
| Lint | `bun run lint` |

- **Runtime:** Bun (`bun.lock`).
- **Build:** esbuild → `src/extension.ts` → `dist/extension.js`.
- **README Differentiation**: The main `README.md` uses an image for the Experimental section title (`![Experimental — New](...)`), whereas the localized READMEs in `public/docs/` use text headers (e.g., `## 🧪 Funciones Experimentales — Nuevo`). This is intentional to distinguish the primary documentation.


## Actual Structure
```
src/
├── extension.ts              # Entry point — registers all managers
├── keymaps/
│   ├── index.ts              # Barrel export
│   ├── ai/
│   │   ├── configs.ts        # Editor signatures & AI command mappings
│   │   └── controller.ts     # Detection & execution logic
│   └── terminal/
│       ├── shared.ts         # Terminal state management
│       ├── side-panel.ts     # Left/Right toggle
│       └── bottom-panel.ts   # Bottom toggle
└── notifications/
    ├── info.ts               # Standard alerts
    └── whith-buttons.ts      # Actionable notifications
```

## AI Command Logic
1. `configs.ts` defines `AI_COMMANDS` (mapping internal actions to editor-specific commands).
2. `controller.ts` detects the editor type and executes the corresponding native command.

## Required External Extensions
| Extension | ID | Shortcut |
|-----------|-----|----------|
| F1-Quick Switch | `bastndev.f1` | `Ctrl+4` |
| GitLab | `bastndev.atm` | `Ctrl+Q` |
| Compare Code | `bastndev.compare-code` | `Shift+Alt+\` |
