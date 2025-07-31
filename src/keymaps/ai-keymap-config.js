/*
 *** AI COMMANDS CONFIGURATION
*/

const AI_COMMANDS_CONFIG = {
  // AI COMMIT GENERATION COMMANDS MARK:[Alt+2]
  commitCommands: [
    'windsurf.generateCommitMessage',                     // 0: Windsurf
    'github.copilot.git.generateCommitMessage',           // 1: Vscode
    'cursor.generateGitCommitMessage',                    // 2: Cursor-AI
    'icube.gitGenerateCommitMessage',                     // 3: Trae-AI
    // Don't have a Firebase equivalent for this          // 4: Firebase.Studio
    // 'kiro.generateCommitMessage',                      // 5: Kiro (example)
  ],

  // AI POPUP COMMANDS MARK:[Ctrl`]
  popupCommands: [
    'windsurf.prioritized.command.open',                  // 0: Windsurf
    'inlineChat.start',                                   // 1: Vscode
    'aipopup.action.modal.generate',                      // 2: Cursor-AI
    'icube.inlineChat.start',                             // 3: Trae-AI
    'workbench.action.terminal.chat.start',               // 4: Firebase.Studio
    'kiroAgent.inlineChat.start',                         // Kiro
  ],

  // AI CHAT COMMANDS MARK:[Shift+Tab]
  chatCommands: [
    'kiroAgent.continueGUIView.focus',                    // Kiro
    'windsurf.prioritized.chat.open',                     // 0: Windsurf
    'workbench.panel.chat',                               // 1: Vscode
    'aichat.newchataction',                               // 2: Cursor-AI
    'workbench.action.chat.icube.open',                   // 3: Trae-AI
    'aichat.prompt',                                      // 4: Firebase.Studio
  ],

  // NEW AI SESSION COMMANDS MARK:[Alt+A]
  newSessionCommands: [
    'windsurf.prioritized.chat.openNewConversation',         // 0: Windsurf
    'workbench.action.chat.newEditSession',                  // 1: Vscode
    'composer.createNew',                                    // 2: Cursor-AI
    'workbench.action.icube.aiChatSidebar.createNewSession', // 3: Trae-AI
    // 'workbench.action.chat.newChat' NF-now                // 4: Firebase.Studio
    'kiroAgent.newSession'                                   // Kiro
  ],

  // AI HISTORY COMMANDS MARK:[Alt+S]
  historyCommands: [
    'kiroAgent.viewHistoryChats',                         // Kiro
    // ---- ---- ---- ---- --- -- -                       // 0: Windsurf
    'workbench.action.chat.history',                      // 1: Vscode
    'composer.showComposerHistory',                       // 2: Cursor-AI
    'workbench.action.icube.aiChatSidebar.showHistory',   // 3: Trae-AI
    // Firebase doesn't have a history NF-now             // 4: Firebase.Studio
  ],

  // AI ATTACH CONTEXT COMMANDS MARK:[Alt+D]
  attachContextCommands: [
    // ---- ---- ---- ---- --- -- -                      // 0: Windsurf
    'workbench.action.chat.attachContext',               // 1: Vscode
    'composer.openAddContextMenu',                       // 2: Cursor-AI
    // ---- ---- --- --- -- -                            // 3: Trae-AI
    // 'Workbench.action.openWorkspace' NF-now           // 4: Firebase.Studio
    // ---- ---- ---- ---- --- -- -                      // 5: Kiro (example)
  ],
};

// KEYMAP CONFIGURATION
// Add new keymaps here following the same pattern
const KEYMAP_CONFIG = [
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

module.exports = {
  AI_COMMANDS_CONFIG,
  KEYMAP_CONFIG
};