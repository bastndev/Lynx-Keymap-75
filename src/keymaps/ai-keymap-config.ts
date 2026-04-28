/*
 *** AI COMMANDS CONFIGURATION
 */

// ─── Editor Types ────────────────────────────────────────────────────────────
export enum EditorType {
  ANTIGRAVITY = 'antigravity',
  WINDSURF    = 'windsurf',
  CURSOR      = 'cursor',
  TRAE_AI     = 'trae-ai',
  KIRO        = 'kiro',
  FIREBASE    = 'firebase',
  VSCODE      = 'vscode',
  UNKNOWN     = 'unknown'
}

// ─── Detection Signatures ────────────────────────────────────────────────────
// Commands unique to each editor, used to detect which one is running
export const EDITOR_SIGNATURES: Record<EditorType, string[]> = {
  [EditorType.ANTIGRAVITY]: ['antigravity.startNewConversation', 'antigravity.prioritized.command.open'],
  [EditorType.WINDSURF]:    ['windsurf.prioritized.chat.open',   'windsurf.generateCommitMessage'],
  [EditorType.CURSOR]:      ['composer.createNew',               'cursor.generateGitCommitMessage'],
  [EditorType.TRAE_AI]:     ['icube.inlineChat.start',           'icube.gitGenerateCommitMessage'],
  [EditorType.KIRO]:        ['kiroAgent.newSession',             'kiroAgent.inlineChat.start'],
  [EditorType.FIREBASE]:    ['workbench.action.terminal.chat.start'],
  [EditorType.VSCODE]:      ['inlineChat.start',                 'workbench.action.chat.newEditSession'],
  [EditorType.UNKNOWN]:     []
};

// ─── Action Keys ─────────────────────────────────────────────────────────────
export type ActionKey =
  | 'commitCommands'
  | 'popupCommands'
  | 'chatCommands'
  | 'newSessionCommands'
  | 'historyCommands'
  | 'attachContextCommands';

// ─── Commands by Action → Editor ─────────────────────────────────────────────
export type EditorCommandMap = Partial<Record<EditorType, string>>;

export const AI_COMMANDS: Record<ActionKey, EditorCommandMap> = {

  // MARK:[Alt+2]
  commitCommands: {
    [EditorType.ANTIGRAVITY]: 'antigravity.generateCommitMessage',
    [EditorType.WINDSURF]:    'windsurf.generateCommitMessage',
    [EditorType.VSCODE]:      'github.copilot.git.generateCommitMessage',
    [EditorType.CURSOR]:      'cursor.generateGitCommitMessage',
    [EditorType.TRAE_AI]:     'icube.gitGenerateCommitMessage',
  },

  // MARK:[Ctrl`]
  popupCommands: {
    [EditorType.ANTIGRAVITY]: 'antigravity.prioritized.command.open',
    [EditorType.WINDSURF]:    'windsurf.prioritized.command.open',
    [EditorType.VSCODE]:      'inlineChat.start',
    [EditorType.CURSOR]:      'aipopup.action.modal.generate',
    [EditorType.TRAE_AI]:     'icube.inlineChat.start',
    [EditorType.FIREBASE]:    'workbench.action.terminal.chat.start',
    [EditorType.KIRO]:        'kiroAgent.inlineChat.start',
  },

  // MARK:[Shift+Tab]
  chatCommands: {
    [EditorType.WINDSURF]:    'windsurf.prioritized.chat.open',
    [EditorType.VSCODE]:      'workbench.panel.chat',
    [EditorType.CURSOR]:      'workbench.action.toggleAuxiliaryBar',
    [EditorType.TRAE_AI]:     'workbench.action.chat.icube.open',
    [EditorType.FIREBASE]:    'aichat.prompt',
    [EditorType.KIRO]:        'workbench.action.toggleAuxiliaryBar',
  },

  // MARK:[Alt+A]
  newSessionCommands: {
    [EditorType.ANTIGRAVITY]: 'antigravity.startNewConversation',
    [EditorType.WINDSURF]:    'windsurf.prioritized.chat.openNewConversation',
    [EditorType.VSCODE]:      'workbench.action.chat.newEditSession',
    [EditorType.CURSOR]:      'composer.createNew',
    [EditorType.TRAE_AI]:     'workbench.action.icube.aiChatSidebar.createNewSession',
    [EditorType.KIRO]:        'kiroAgent.newSession',
  },

  // MARK:[Alt+S]
  historyCommands: {
    [EditorType.CURSOR]:      'composer.showComposerHistory',
    [EditorType.KIRO]:        'kiroAgent.viewHistoryChats',
    [EditorType.VSCODE]:      'workbench.action.chat.history',
    [EditorType.TRAE_AI]:     'workbench.action.icube.aiChatSidebar.showHistory',
  },

  // MARK:[Alt+D]
  attachContextCommands: {
    [EditorType.VSCODE]:      'workbench.action.chat.attachContext',
    [EditorType.CURSOR]:      'composer.openAddContextMenu',
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
    commandsKey:  'commitCommands',
    errorMessage: 'No AI commit generators available'
  },
  {
    commandId:    'lynx-keymap.executeAIPopup',
    commandsKey:  'popupCommands',
    errorMessage: 'No AI popup providers available'
  },
  {
    commandId:    'lynx-keymap.openAndCloseAIChat',
    commandsKey:  'chatCommands',
    errorMessage: 'No AI chat providers available'
  },
  {
    commandId:    'lynx-keymap.createNewAISession',
    commandsKey:  'newSessionCommands',
    errorMessage: 'No AI providers available to create a new session'
  },
  {
    commandId:    'lynx-keymap.showAIHistory',
    commandsKey:  'historyCommands',
    errorMessage: 'No AI history available'
  },
  {
    commandId:    'lynx-keymap.attachAIContext',
    commandsKey:  'attachContextCommands',
    errorMessage: 'No AI context attachment available'
  }
];