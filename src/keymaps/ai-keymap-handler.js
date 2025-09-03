const vscode = require('vscode');
const { AI_COMMANDS_CONFIG, KEYMAP_CONFIG } = require('./ai-keymap-config');
const TabMessageManager = require('../notifications/tab-messages');

/**
 * Manages AI command registration and execution
 */
class AICommandsManager {
  constructor() {
    this.disposables = [];
    this.isInitialized = false;
    this.availableCommands = new Set(); 
    this.lastCommandCheck = 0;
  }

  /**
   * Registers AI commands from config
   */
  registerCommands(context) {
    // Create command registrations from KEYMAP_CONFIG - ULTRA FAST
    const disposables = KEYMAP_CONFIG.map((config) => {
      return vscode.commands.registerCommand(config.commandId, async () => {
        // Execute command with smart loading logic
        const commands = AI_COMMANDS_CONFIG[config.commandsKey];
        await this.executeCommandWithSmartLoading(commands, config.errorMessage, config.commandId);
      });
    });

    // Store for cleanup and register immediately
    this.disposables = disposables;
    context.subscriptions.push(...this.disposables);

    // Start background AI detection (non-blocking)
    this.initializeAIReadiness();

    return this.disposables;
  }

  /**
   * Execute command with smart loading logic
   */
  async executeCommandWithSmartLoading(commands, errorMessage, commandId) {
    // Check if we have any available command for this group
    const hasAvailableCommand = await this.hasAnyAvailableCommand(commands);
    
    if (hasAvailableCommand) {
      // Command is available, execute immediately without loading message
      const success = await this.tryExecuteWithRetry(commands, 1, 100);
      if (!success) {
        TabMessageManager.showError(errorMessage);
      }
    } else {
      // No command available, show loading and try with retries
      const keyComboName = this.getKeyComboName(commandId);
      TabMessageManager.showAILoadingMessage(keyComboName, 1500);
      
      const success = await this.tryExecuteWithRetry(commands, 2, 300);
      if (!success) {
        TabMessageManager.showError(errorMessage);
      }
    }
  }

  /**
   * Check if any command from the list is available (with caching)
   */
  async hasAnyAvailableCommand(commands) {
    const now = Date.now();
    
    // Refresh cache every 2 seconds
    if (now - this.lastCommandCheck > 2000) {
      const allCommands = await vscode.commands.getCommands(true);
      this.availableCommands = new Set(allCommands);
      this.lastCommandCheck = now;
    }
    
    // Check if any command from the list is available
    return commands.some(cmd => this.availableCommands.has(cmd));
  }

  /**
   * Initialize AI readiness check in background
   */
  async initializeAIReadiness() {
    // Check every 500ms for AI extensions, max 6 seconds
    let attempts = 0;
    const maxAttempts = 12;
    
    const checkInterval = setInterval(async () => {
      attempts++;
      
      // Check if any AI commands are available
      const allCommands = await vscode.commands.getCommands(true);
      const hasAnyAICommand = Object.values(AI_COMMANDS_CONFIG)
        .flat()
        .some(cmd => allCommands.includes(cmd));
      
      if (hasAnyAICommand || attempts >= maxAttempts) {
        clearInterval(checkInterval);
        this.isInitialized = true;
        
        // Update cache with current commands
        this.availableCommands = new Set(allCommands);
        this.lastCommandCheck = Date.now();
        
        if (hasAnyAICommand) {
          TabMessageManager.logSuccess('AI extensions detected and ready');
        } else {
          TabMessageManager.logInfo('No AI extensions detected after initialization');
        }
      }
    }, 500);
  }



  /**
   * Gets friendly name for key combination based on command ID
   */
  getKeyComboName(commandId) {
    const keyMappings = {
      'lynx-keymap.generateAICommit': 'Alt+2 (AI Commit)',
      'lynx-keymap.executeAIPopup': 'Ctrl+` (AI Popup)',
      'lynx-keymap.openAndCloseAIChat': 'Shift+Tab (AI Chat)',
      'lynx-keymap.createNewAISession': 'Alt+A (New AI Session)',
      'lynx-keymap.showAIHistory': 'Alt+S (AI History)',
      'lynx-keymap.attachAIContext': 'Alt+D (AI Context)'
    };
    
    return keyMappings[commandId] || 'AI Keymap';
  }

  /**
   * Try to execute commands with retry mechanism
   */
  async tryExecuteWithRetry(commands, maxRetries = 3, delayMs = 500) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Use cached commands if available and recent
      let allCommands;
      const now = Date.now();
      
      if (now - this.lastCommandCheck < 1000 && this.availableCommands.size > 0) {
        // Use cached commands (less than 1 second old)
        allCommands = this.availableCommands;
      } else {
        // Refresh commands
        const freshCommands = await vscode.commands.getCommands(true);
        allCommands = new Set(freshCommands);
        this.availableCommands = allCommands;
        this.lastCommandCheck = now;
      }

      // Try each command until one succeeds
      for (const cmd of commands) {
        if (allCommands.has(cmd)) {
          try {
            await vscode.commands.executeCommand(cmd);
            TabMessageManager.logSuccess(`Executed: ${cmd}`);
            return true;
          } catch (error) {
            TabMessageManager.logError(`Failed to execute ${cmd}`, error);
            // Continue to next command
          }
        }
      }

      // Wait before retry (except on last attempt)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    TabMessageManager.logError(`All commands failed after ${maxRetries} attempts`);
    return false;
  }

  /**
   * Cleans up disposables
   */
  dispose() {
    this.disposables.forEach((disposable) => {
      if (disposable && typeof disposable.dispose === 'function') {
        disposable.dispose();
      }
    });
    this.disposables = [];
  }
}

module.exports = AICommandsManager;
