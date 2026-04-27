/*
 *** AI COMMANDS CONFIGURATION
 */

export const AI_COMMANDS_CONFIG: Record<string, string[]> = {
  commitCommands: [
    'windsurf.generateCommitMessage',
    'github.copilot.git.generateCommitMessage',
    'cursor.generateGitCommitMessage',
    'icube.gitGenerateCommitMessage',
    'antigravity.generateCommitMessage'
  ],

  popupCommands: [
    'windsurf.prioritized.command.open',
    'inlineChat.start',
    'aipopup.action.modal.generate',
    'icube.inlineChat.start',
    'workbench.action.terminal.chat.start',
    'kiroAgent.inlineChat.start',
    'antigravity.prioritized.command.open',
  ],

  chatCommands: [
    'workbench.action.toggleAuxiliaryBar',
    'windsurf.prioritized.chat.open',
    'workbench.panel.chat',
    'workbench.action.chat.icube.open',
    'aichat.prompt',
    'workbench.action.toggleAuxiliaryBar',
  ],

  newSessionCommands: [
    'windsurf.prioritized.chat.openNewConversation',
    'workbench.action.chat.newEditSession',
    'composer.createNew',
    'workbench.action.icube.aiChatSidebar.createNewSession',
    'kiroAgent.newSession',
    'antigravity.prioritized.chat.openNewConversation',
  ],

  historyCommands: [
    'composer.showComposerHistory',
    'kiroAgent.viewHistoryChats',
    'workbench.action.chat.history',
    'workbench.action.icube.aiChatSidebar.showHistory',
  ],

  attachContextCommands: [
    'workbench.action.chat.attachContext',
    'composer.openAddContextMenu',
  ],
};

export interface KeymapConfig {
  commandId: string;
  commandsKey: string;
  errorMessage: string;
}

export const KEYMAP_CONFIG: KeymapConfig[] = [
  {
    commandId: 'lynx-keymap.generateAICommit',
    commandsKey: 'commitCommands',
    errorMessage: 'No AI commit generators available'
  },
  {
    commandId: 'lynx-keymap.executeAIPopup',
    commandsKey: 'popupCommands',
    errorMessage: 'No AI chat providers available'
  },
  {
    commandId: 'lynx-keymap.openAndCloseAIChat',
    commandsKey: 'chatCommands',
    errorMessage: 'No AI chat providers available'
  },
  {
    commandId: 'lynx-keymap.createNewAISession',
    commandsKey: 'newSessionCommands',
    errorMessage: 'No AI providers available to create a new session'
  },
  {
    commandId: 'lynx-keymap.showAIHistory',
    commandsKey: 'historyCommands',
    errorMessage: 'No AI history available'
  },
  {
    commandId: 'lynx-keymap.attachAIContext',
    commandsKey: 'attachContextCommands',
    errorMessage: 'No AI context attachment available'
  }
];
