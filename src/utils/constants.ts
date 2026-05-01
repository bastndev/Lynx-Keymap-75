// ─── Command IDs ─────────────────────────────────────────────────────────────

export const COMMAND_IDS = {
  AI: {
    GENERATE_COMMIT: 'lynx-keymap.generateAICommit',
    OPEN_AI_CHAT: 'lynx-keymap.openAndCloseAIChat',
    NEW_AI_SESSION: 'lynx-keymap.createNewAISession',
    AI_HISTORY: 'lynx-keymap.showAIHistory',
    SELECT_MODELS: 'lynx-keymap.selectModels',
    TOGGLE_AGENT: 'lynx-keymap.toggleAgentMode',
    SELECT_CODE: 'lynx-keymap.selectCode',
  },
  TERMINAL: {
    TOGGLE_LEFT: 'lynx-keymap.toggleTerminalLeft',
    TOGGLE_BOTTOM: 'lynx-keymap.toggleTerminalBottom',
  },
  EXTENSION_CHECK: {
    F1_QUICK_SWITCH: 'lynx-keymap.checkF1QuickSwitch',
    GITLAB: 'lynx-keymap.checkGitLab',
  },
  WEBVIEW: {
    COMPARE_CODE: 'lynx-keymap.checkCompareCode',
  },
} as const;

// ─── Extension Dependencies ──────────────────────────────────────────────────

export interface ExtensionDependency {
  extensionId: string;
  displayName: string;
  marketplaceSearch: string;
}

export const EXTENSION_DEPENDENCIES: Record<string, ExtensionDependency> = {
  'workbench.view.extension.f1-functions': {
    extensionId: 'bastndev.f1',
    displayName: 'F1-Quick Switch',
    marketplaceSearch: 'bastndev.f1',
  },
  'gitlab.graphView.focus': {
    extensionId: 'bastndev.atm',
    displayName: 'GitLab',
    marketplaceSearch: 'bastndev.atm',
  },
} as const;

export interface WebviewExtension {
  extensionId: string;
  displayName: string;
  marketplaceSearch: string;
  originalKeybinding: string;
  webviewCommand: string;
  originalCommand: string;
}

export const WEBVIEW_EXTENSIONS: Record<string, WebviewExtension> = {
  'compare-code.openWebview': {
    extensionId: 'bastndev.compare-code',
    displayName: 'Compare Code',
    marketplaceSearch: 'bastndev.compare-code',
    originalKeybinding: 'shift+alt+\\',
    webviewCommand: 'compare-code.compareFiles',
    originalCommand: 'Compare Code',
  },
} as const;

// ─── Storage Keys ────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  LAST_ACTIVE_MODE: 'lynx-keymap:lastActiveMode',
  ORIGINAL_TABS_ENABLED: 'lynx-keymap:originalTabsEnabled',
  ORIGINAL_PANEL_SHOW_LABELS: 'lynx-keymap:originalPanelShowLabels',
  PANEL_POSITION: 'lynx-keymap:terminalPanelPosition',
} as const;

// ─── Log Prefix ──────────────────────────────────────────────────────────────

export const LOG_PREFIX = '[lynx-keymap]';
