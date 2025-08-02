# Lynx Keymap 75%

🎯 **Optimized for 75% Keyboards** 🎯

A comprehensive keymap extension designed specifically for 75% keyboards, providing consistent shortcuts across multiple modern code editors and AI-powered development environments.

## Supported Editors

- **VS Code** - Microsoft Visual Studio Code
- **Cursor** - AI-first code editor
- **Windsurf** - AI-powered development environment
- **Trae.ai** - AI coding assistant
- **Kiro** - Modern code editor
- **Firebase Studio** - Google's development platform

## Key Features

- **Universal Shortcuts**: Same key combinations work across all supported editors
- **75% Keyboard Optimized**: Designed specifically for compact 75% keyboard layouts
- **AI-Enhanced Workflow**: Special shortcuts for AI commands and integrations
- **Multi-Language Support**: Backquote key equivalents for international keyboards
- **Experimental Features**: Cutting-edge shortcuts for the latest AI tools

Discover more extensions at [bastndev.com/extensions](https://bastndev.com/extensions)

---

## Changelog

Following semantic versioning principles for consistent and predictable releases.

## [1.2.2] - 2025-08-02

### Changed
- **Inverted Key Combos**: Key combinations in the `package.json` file were inverted to improve ergonomics and adaptability across different platforms and user preferences.

### Improved
- Enhanced consistency of keyboard shortcuts across operating systems.
- Updated documentation to reflect the new keybinding changes.

### Fixed
- Fixed potential shortcut conflicts after key inversion.
- Improved handling of custom shortcuts in AI environments and supported editors.

## [1.2.0] - 2025-08-01

### Added
- **Custom Notifications**: Introduced personalized notification system for keymap events and updates
  - Receive in-editor alerts for new shortcut releases and important changes
  - Customizable notification preferences per editor
- **Extension Check Shortcuts**: Added new commands for extension checks
  - `lynx-keymap.checkF1Toggles` - Checks if the F1-Toggles extension is installed; prompts to install if missing
  - `lynx-keymap.checkGitLens` - Checks if the GitLens extension is installed; prompts to install if missing

### Improved
- Enhanced user feedback for shortcut activation
- Improved onboarding experience with notification-driven tips

### Fixed
- Minor bugs related to notification display on certain platforms
- Resolved rare issues with notification timing in Cursor and Windsurf editors


## [1.1.1] - 2025-07-31

### Added
- **New Keyboard Shortcuts**: Enhanced productivity with additional keymaps
  - `Shift + Alt + T` - Select theme (quick theme switching)
  - `Shift + Alt + R` - Reload window (instant environment refresh)
  - `Shift + Alt + E` - Go to line (precise navigation)
  - `Shift + Alt + W` - Expand line selection (enhanced text selection)
- **Community Documentation**: Professional contribution guidelines
  - `CODE_OF_CONDUCT.md` - Community standards and behavior guidelines
  - `CONTRIBUTING.md` - Developer contribution instructions and workflow

### Changed
- **Enhanced README**: Improved documentation structure and presentation
- **Optimized Existing Keymaps**: Refined shortcut combinations for better ergonomics

### Improved
- Better keymap organization and categorization
- Enhanced user experience with more intuitive shortcuts
- Strengthened project governance with community guidelines

## [1.0.7] - 2025-07-24

### Added
- **Professional Changelog**: Complete changelog documentation with version history
- **Repository Star Button**: New ⭐️ button linking directly to GitHub repository for easy starring
- **Enhanced Banner**: Improved visual design and branding consistency

### Changed
- Updated documentation structure for better readability
- Improved README formatting and presentation

### Fixed
- Minor documentation inconsistencies
- Enhanced visual elements positioning

## [1.0.2] - 2025-07-22

### Added
- Enhanced experimental keymaps section with better categorization
- Improved AI command shortcuts documentation

### Fixed
- Key binding conflicts resolution across different editors
- Better handling of international keyboard layouts

## [1.0.0] - 2025-07-20

### Added
- **Firebase Studio Support**: Added dedicated shortcuts for Firebase development workflow
- **Kiro Editor Integration**: Full keymap support for Kiro code editor

### Changed
- Optimized shortcut combinations for better ergonomics on 75% keyboards
- Updated installation instructions with platform-specific guidance

## [0.9.6] - 2025-07-18

### Added
- **Experimental AI Features**: New shortcuts for AI-powered code generation and editing
- `Alt + Z` - Ask, agent, edit functionality (VS Code only)
- `Alt + X` - Pick AI model selection (VS Code only)
- `Shift + Esc` - Maximize & minimize AI interface (VS Code only)

### Fixed
- Improved compatibility with Trae.ai interface
- Better handling of AI chat interface shortcuts

## [0.9.2] - 2025-07-15

### Added
- **Multi-Language Keyboard Support**: Extended backquote key equivalents for international layouts
- Support for Spanish, French, German, Russian, Japanese, Portuguese, Italian, Turkish keyboards
- **Bottom Color Change**: `Ctrl + Alt + P` for theme color switching

### Changed
- Enhanced documentation with emoji indicators for better visual navigation
- Improved table formatting for better readability

## [0.8.1] - 2025-07-12

### Added
- **Windsurf Editor Support**: Complete keymap integration for Windsurf AI development environment
- **Enhanced Git Workflow**: Streamlined shortcuts for version control operations
- AI-powered commit message generation with `Alt + 2`

### Fixed
- Resolved key binding conflicts between different editors
- Improved shortcut consistency across platforms (macOS, Windows, Linux)

## [0.5.0] - 2025-07-10

### Initial Release
- **Universal Keymap System**: Consistent shortcuts across VS Code, Cursor, Windsurf, Trae.ai
- **75% Keyboard Optimization**: Specially designed for compact keyboard layouts
- **Core Functionality**:
  - File and folder management shortcuts
  - Git integration commands
  - Debugging and terminal controls
  - Code formatting and organization
  - AI chat interface controls
- **Platform Support**: macOS, Windows, and Linux compatibility
- **Multi-Editor Support**: Seamless experience across modern code editors

### Key Shortcuts Introduced
- `Ctrl +` Tab - Toggle sidebar across all editors
- `Alt +` W - Universal terminal toggle
- `Alt +` F - Consistent code formatting
- `Ctrl` + `  - AI chat interface (universal)
- And 40+ more essential shortcuts

## [0.0.1] - 2025-04-26

### Initial Release
- Initial release of Lynx Keymap 75%
- Basic keymap implementation for VS Code
- Core keyboard shortcut infrastructure and settings
- Foundation for multi-editor support
