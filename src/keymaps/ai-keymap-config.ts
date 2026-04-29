export enum EditorType {
  ANTIGRAVITY = 'antigravity',
  VSCODE      = 'vscode',
  KIRO        = 'kiro',
  CURSOR      = 'cursor',
  WINDSURF    = 'windsurf',
  TRAE_AI     = 'trae-ai',
  FIREBASE    = 'firebase',
  UNKNOWN     = 'unknown'
}

// ─── Detection Signatures ────────────────────────────────────────────────────
export const EDITOR_SIGNATURES: Record<EditorType, string[]> = {
  [EditorType.ANTIGRAVITY]: ['antigravity.startNewConversation', 'antigravity.prioritized.command.open'],
  [EditorType.VSCODE]:      ['inlineChat.start',                 'workbench.action.chat.newEditSession'],
  [EditorType.KIRO]:        ['kiroAgent.newSession',             'kiroAgent.inlineChat.start'],
  [EditorType.CURSOR]:      ['composer.createNew',               'cursor.generateGitCommitMessage'],
  [EditorType.WINDSURF]:    ['windsurf.prioritized.chat.open',   'windsurf.generateCommitMessage'],
  [EditorType.TRAE_AI]:     ['icube.inlineChat.start',           'icube.gitGenerateCommitMessage'],
  [EditorType.FIREBASE]:    ['workbench.action.terminal.chat.start'],
  [EditorType.UNKNOWN]:     []
};

// ─── Action Keys ─────────────────────────────────────────────────────────────
export type ActionKey =
  | 'generateAICommit'
  | 'executeAIPopup'
  | 'openAndCloseAIChat'
  | 'createNewAISession'
  | 'showAIHistory'
  | 'attachAIContext'
  | 'toggleAgentMode'
  | 'openModelPicker'
  | 'selectCode';

// ─── Commands by Action → Editor ─────────────────────────────────────────────
export type EditorCommandMap = Partial<Record<EditorType, string>>;

export const AI_COMMANDS: Record<ActionKey, EditorCommandMap> = {

  // MARK:[Alt+2]
  generateAICommit: {
    [EditorType.ANTIGRAVITY]: 'antigravity.generateCommitMessage',
    [EditorType.VSCODE]:      'github.copilot.git.generateCommitMessage',
    [EditorType.KIRO]:        'kiroAgent.generateCommitMessage',
    [EditorType.CURSOR]:      'cursor.generateGitCommitMessage',
    [EditorType.WINDSURF]:    'windsurf.generateCommitMessage',
    [EditorType.TRAE_AI]:     'icube.gitGenerateCommitMessage',
    // [EditorType.FIREBASE]: [no support]
  },

  // MARK:[Ctrl`]
  executeAIPopup: {
    [EditorType.ANTIGRAVITY]: 'antigravity.prioritized.command.open',
    [EditorType.VSCODE]:      'inlineChat.start',
    [EditorType.KIRO]:        'kiroAgent.inlineChat.start',
    [EditorType.CURSOR]:      'aipopup.action.modal.generate',
    [EditorType.WINDSURF]:    'windsurf.prioritized.command.open',
    [EditorType.TRAE_AI]:     'icube.inlineChat.start',
    [EditorType.FIREBASE]:    'workbench.action.terminal.chat.start',
  },

  // MARK:[Shift+Tab]
  openAndCloseAIChat: {
    [EditorType.ANTIGRAVITY]: 'antigravity.openAgent',
    [EditorType.VSCODE]:      'workbench.panel.chat',
    [EditorType.KIRO]:        'workbench.action.toggleAuxiliaryBar',
    [EditorType.CURSOR]:      'workbench.action.toggleAuxiliaryBar',
    [EditorType.WINDSURF]:    'windsurf.prioritized.chat.open',
    [EditorType.TRAE_AI]:     'workbench.action.chat.icube.open',
    [EditorType.FIREBASE]:    'aichat.prompt',
  },

  // MARK:[Alt+A]
  createNewAISession: {
    [EditorType.ANTIGRAVITY]: 'antigravity.startNewConversation',
    [EditorType.VSCODE]:      'workbench.action.chat.newEditSession',
    [EditorType.KIRO]:        'kiroAgent.newSession',
    [EditorType.CURSOR]:      'composer.createNew',
    [EditorType.WINDSURF]:    'windsurf.prioritized.chat.openNewConversation',
    [EditorType.TRAE_AI]:     'workbench.action.icube.aiChatSidebar.createNewSession',
    // [EditorType.FIREBASE]: [no support]
  },

  // MARK:[Alt+S]
  attachAIContext: {
    [EditorType.ANTIGRAVITY]: 'antigravity.toggleModelSelector',
    [EditorType.VSCODE]:      'workbench.action.chat.attachContext',
    // [EditorType.KIRO]:     [no support]
    [EditorType.CURSOR]:      'composer.openAddContextMenu',
    // [EditorType.WINDSURF]: [no support]
    // [EditorType.TRAE_AI]:  [no support]
    // [EditorType.FIREBASE]: [no support]
  },
  
  // MARK:[Alt+D]
  selectCode: {
    [EditorType.ANTIGRAVITY]: 'antigravity.toggleChatFocus',
    // [EditorType.VSCODE]:   [no support]
    [EditorType.KIRO]:        'kiroAgent.focusContinueInputWithoutNewSession',
    [EditorType.CURSOR]:      'aichat.newhatction',
    // [EditorType.WINDSURF]: [no support]
    // [EditorType.TRAE_AI]:  [no support]
    // [EditorType.FIREBASE]: [no support]
  },

  // MARK:[Shift+Alt+A]
  toggleAgentMode: {
    [EditorType.ANTIGRAVITY]: 'workbench.action.chat.toggleAgentMode',
    [EditorType.VSCODE]:      'workbench.action.chat.toggleAgentMode',
    // [EditorType.KIRO]:     [no support]
    [EditorType.CURSOR]:      'workbench.action.toggleAuxiliaryBart',
    [EditorType.WINDSURF]:    'windsurf.toggleAgentMode',
    // [EditorType.TRAE_AI]:  [no support]
    // [EditorType.FIREBASE]: [no support]
  },

  // MARK:[Shift+Alt+S]
  showAIHistory: {
    [EditorType.ANTIGRAVITY]: 'antigravity.openConversationPicker',
    [EditorType.VSCODE]:      'workbench.action.chat.history',
    [EditorType.KIRO]:        'kiroAgent.viewHistoryChats',
    [EditorType.CURSOR]:      'composer.showComposerHistory',
    // [EditorType.WINDSURF]: [no support]
    [EditorType.TRAE_AI]:     'workbench.action.icube.aiChatSidebar.showHistory',
    // [EditorType.FIREBASE]: [no support]
  },

  // MARK:[Shift+Alt+D]
  openModelPicker: {
    [EditorType.ANTIGRAVITY]: 'workbench.action.chat.openModelPicker',
    [EditorType.VSCODE]:      'workbench.action.chat.openModelPicker',
    // [EditorType.KIRO]:     [no support]
    [EditorType.CURSOR]:      'composer.openModelPicker',
    [EditorType.WINDSURF]:    'windsurf.openModelPicker',
    // [EditorType.TRAE_AI]:  [no support]
    // [EditorType.FIREBASE]: [no support]
  },
};

// ─── Keymap Config ────────────────────────────────────────────────────────────
export interface KeymapConfig {
  commandId: string;
  commandsKey: ActionKey;
  errorMessage: string;
}

export const KEYMAP_CONFIG: KeymapConfig[] = [
  {
    commandId:    'lynx-keymap.generateAICommit',
    commandsKey:  'generateAICommit',
    errorMessage: 'No AI commit generators available'
  },
  {
    commandId:    'lynx-keymap.executeAIPopup',
    commandsKey:  'executeAIPopup',
    errorMessage: 'No AI popup providers available'
  },
  {
    commandId:    'lynx-keymap.openAndCloseAIChat',
    commandsKey:  'openAndCloseAIChat',
    errorMessage: 'No AI chat providers available'
  },
  {
    commandId:    'lynx-keymap.createNewAISession',
    commandsKey:  'createNewAISession',
    errorMessage: 'No AI providers available to create a new session'
  },
  {
    commandId:    'lynx-keymap.showAIHistory',
    commandsKey:  'showAIHistory',
    errorMessage: 'No AI history available'
  },
  {
    commandId:    'lynx-keymap.attachAIContext',
    commandsKey:  'attachAIContext',
    errorMessage: 'No AI context attachment available'
  },
  {
    commandId:    'lynx-keymap.toggleAgentMode',
    commandsKey:  'toggleAgentMode',
    errorMessage: 'No AI agent toggle available'
  },
  {
    commandId:    'lynx-keymap.selectCode',
    commandsKey:  'selectCode',
    errorMessage: 'No AI select code available'
  },
  {
    commandId:    'lynx-keymap.openModelPicker',
    commandsKey:  'openModelPicker',
    errorMessage: 'No AI model picker available'
  }
];