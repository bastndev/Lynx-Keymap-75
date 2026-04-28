# Lynx Keymap 75% Architecture

## Overview

**Lynx Keymap 75%** standardizes keyboard shortcuts across all code editors, specifically adapted for 75% keyboards. It enables developers to use key combinations to access any functionality with precision and consistency, optimizing development workflow with a unified and efficient experience regardless of the editor used.

**Available now**: VS Code • Cursor • Windsurf • Trae.ai • Kiro • Firebase Studio

### Key Value Propositions

- **🎯 75% Keyboard Optimization**: Tailored shortcuts that maximize compact layout efficiency
- **🌐 Universal Editor Support**: Consistent experience across 6 major code editors
- **🤖 Intelligent AI Integration**: Smart fallback system for AI commands across platforms
- **⚡ Enhanced Productivity**: Streamlined workflows through optimized key combinations

## Architecture Diagram

```mermaid
graph TB
    subgraph "📦 Lynx Keymap 75% Extension"
        direction TB
        A[package.json<br/>📋 Main Configuration]

        subgraph "🎯 Core Systems"
            direction TB
            E[AICommandsManager<br/>🤖 AI Integration]
            F[SwapManager<br/>🔄 Context Swapper]
            G[ExtensionChecker<br/>🔍 Compat Checks]
        end

        subgraph "🌐 Multi-Editor Support"
            direction LR
            K[🌊 Windsurf]
            L[📝 VS Code]
            M[🎯 Cursor-AI]
            N[🚀 Trae-AI]
            O[🔥 Firebase Studio]
            P[🤖 Kiro]
        end
    end

    subgraph "🎯 VS Code Integration"
        direction TB
        W[Extension Host<br/>🏠 Runtime]
        Z[User Interface<br/>👤 Editor Experience]
    end

    %% Main connections
    A --> E
    A --> F
    A --> G
    E --> K
    E --> L
    E --> M
    E --> N
    E --> O
    E --> P
    A -.-> W
    W --> Z

    %% Styling
    classDef mainConfig fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    classDef managers fill:#4ecdc4,stroke:#333,stroke-width:2px,color:#fff
    classDef editors fill:#dda0dd,stroke:#333,stroke-width:2px,color:#000
    classDef integration fill:#a8e6cf,stroke:#333,stroke-width:2px,color:#000

    class A mainConfig
    class E,F,G managers
    class K,L,M,N,O,P editors
    class W,Z integration
```

## 🎹 75% Keyboard Layout

> - 🎯 Optimized Keys: Alt, Ctrl, Insert, Delete, Page Up/Down, Function Keys

```
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬──────────┬─────┐────┐
│ Esc │ F1  │ F2  │ F3  │ F4  │ F5  │ F6  │ F7  │ F8  │ F9  │ F10 │ F11 │ F12 │   Del    │ Ins │ 🛞 │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼──────────┼─────┤────┤
│  `  │  1  │  2  │  3  │  4  │  5  │  6  │  7  │  8  │  9  │  0  │  -  │  =  │ Backsp   │ End │    │
├─────┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬───────┼─────┤────┤
│  Tab   │  Q  │  W  │  E  │  R  │  T  │  Y  │  U  │  I  │  O  │  P  │  [  │  ]  │   \   │ PgUp│    │
├────────┴─┬───┴─┬───┴─┬───┴─┬───┴─┬───┴─┬───┴─┬───┴─┬───┴─┬───┴─┬───┴─┬───┴─┬───┴───────┼─────┤────┤
│   Caps   │  A  │  S  │  D  │  F  │  G  │  H  │  J  │  K  │  L  │  ;  │  '  │   Enter   │ PgDn│    │
├──────────┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┴───────────┼─────┤────┤
│    Shift    │  Z  │  X  │  C  │  V  │  B  │  N  │  M  │  ,  │  .  │  /  │    Shift     │  ↑  │    │
├────┬────────┼─────┴─┬───┴─────┴─────┴─────┴─────┴─────┴─┬───┴─┬───┴─────┼─────────┬────┼─────┤────┤
│Ctrl│   Win  │  Alt  │                Space              │ Alt │  Fn     │   Ctrl  │ ←  │  ↓  │ →  │
└────┴────────┴───────┴───────────────────────────────────┴─────┴─────────┴─────────┴────┴─────┴────┘
```

## ⚡ Quick Start

1. **Install**: Search "Lynx Keymap 75" in VS Code Extensions
2. **Activate**: Restart VS Code - shortcuts are automatically active
3. **Test**: Press `Ctrl+1` (Explorer), `Alt+2` (AI Commit), `Alt+Z` (AI Agent)

## Project Structure

```
lynx-keymap-75/
├── src/
│   ├── extension.ts              # Main entry point
│   ├── keymaps/                  # Keyboard mappings
│   │   ├── ai-keymap-config.ts   # AI commands
│   │   ├── ai-keymap-handler.ts  # AI execution logic
│   │   └── swap.ts               # Context key management
│   └── notifications/            # Compatibility checks
├── assets/                       # Resources
├── package.json                  # Extension config
└── README.md                     # Documentation
```

## Key Features

### 🤖 AI Management System

- **Smart Detection**: Automatically detects available AI providers
- **Intelligent Fallback**: Priority-based command execution across editors
- **Universal Commands**: Same shortcuts work in all supported editors
- **Agent Mode**: Quick toggle for agentic AI behaviors

## Keyboard Shortcuts

| Category        | Shortcut         | Action                             |
| --------------- | ---------------- | ---------------------------------- |
| **Navigation**  | `Ctrl+1/2/3`     | Explorer/Source Control/Extensions |
|                 | `Ctrl+Tab`       | Toggle sidebar                     |
|                 | `Alt+C/V`        | New file/folder                    |
| **Git**         | `Alt+1/3`        | Stage/Unstage all                  |
|                 | `Alt+2`          | AI commit message                  |
|                 | `Alt+4`          | Git pull                           |
|                 | `Alt+Enter`      | Git commit                         |
|                 | `Ctrl+Alt+Enter` | Git push                           |
| **AI**          | `Ctrl+\``        | AI chat popup                      |
|                 | `Shift+Tab`      | AI chat panel                      |
|                 | `Alt+A/S/D`      | New session/History/Context        |
|                 | `Alt+X`          | AI model picker                    |
| **Visual**      | `Ctrl+Alt+PgDn`  | Status bar color                   |
|                 | `Alt+Z`          | Macro (agent + color)              |
| **Development** | `Alt+F`          | Format document                    |
|                 | `Insert`         | Start debugging                    |
|                 | `Alt+Insert`     | Restart debugging                  |

## Multi-Editor Support

**Priority-Based Fallback System**: Same shortcuts work across all editors through intelligent command detection.

| Editor                 | Priority | AI Features              |
| ---------------------- | -------- | ------------------------ |
| 🌊 **Windsurf**        | 0        | Advanced AI capabilities |
| 📝 **VS Code**         | 1        | Standard implementation  |
| 🎯 **Cursor-AI**       | 2        | Specialized AI tools     |
| 🚀 **Trae-AI**         | 3        | Alternative AI provider  |
| 🔥 **Firebase Studio** | 4        | Basic AI support         |
| 🤖 **Kiro**            | 5        | Emerging platform        |

**How it works**: Extension detects available commands and automatically uses the best option for your current editor.

## Installation & Requirements

### Requirements

- **VS Code**: Version 1.74.0 or higher
- **Operating System**: Windows, macOS, Linux
- **Keyboard**: 75% layout recommended (works with any keyboard)

### Installation

1. Open VS Code Extensions (`Ctrl+Shift+X`)
2. Search "Lynx Keymap 75"
3. Click Install
4. Restart VS Code
5. Shortcuts are automatically active

### Migration from Other Keymaps

- **From default VS Code**: All standard shortcuts preserved, new ones added
- **From Vim/Emacs**: Can be used alongside existing keymaps
- **From other extensions**: Disable conflicting keymap extensions first

## Conclusion

**Lynx Keymap 75%** delivers a unified keyboard shortcut experience across all major code editors, specifically optimized for 75% keyboard layouts. By standardizing key combinations and providing intelligent AI integration, it eliminates the friction of switching between editors while maximizing productivity.

### Key Benefits

- **🎯 75% Keyboard Optimized**: Purpose-built for compact layouts with maximum efficiency
- **🌐 Universal Compatibility**: Same shortcuts across 6 major editors
- **🤖 Smart AI Integration**: Intelligent fallback system for AI commands
- **⚡ Enhanced Productivity**: Streamlined workflows through optimized combinations
- **🎨 Visual Feedback**: Dynamic color management for improved UX
- **🔄 Macro Automation**: Complex command sequences with precise timing

**Result**: A maintainable, scalable system that adapts to your tools rather than forcing you to adapt to different shortcut schemes. Perfect for developers who value consistency and efficiency in their development environment.
