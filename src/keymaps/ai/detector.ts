import * as vscode from 'vscode';
import { EDITOR_SIGNATURES, EditorType } from './configs';
import { LOG_PREFIX } from '../../shared/constants';

// Most-specific forks first; plain VSCode is the final fallback.
const DETECTION_ORDER: EditorType[] = [
  EditorType.ANTIGRAVITY,
  EditorType.WINDSURF,
  EditorType.CURSOR,
  EditorType.TRAE_AI,
  EditorType.KIRO,
  EditorType.FIREBASE,
  EditorType.VSCODE,
];

export class EditorDetector {
  private detectedEditor: EditorType | null    = null;
  private allCommandsCache: Set<string> | null = null;
  private cacheTimestamp: number               = 0;
  private readonly CACHE_EXPIRY               = 5 * 60 * 1000; // 5 min

  public async detect(): Promise<EditorType> {
    if (this.detectedEditor) { return this.detectedEditor; }

    const allCommands = await this.getAllCommands();

    for (const editor of DETECTION_ORDER) {
      const signatures = EDITOR_SIGNATURES[editor];
      if (signatures.some(sig => allCommands.has(sig))) {
        this.detectedEditor = editor;
        return editor;
      }
    }

    this.detectedEditor = EditorType.VSCODE;
    console.warn(`${LOG_PREFIX} Editor not detected, defaulting to VSCode`);
    return this.detectedEditor;
  }

  public reset(): void {
    this.detectedEditor   = null;
    this.allCommandsCache = null;
  }

  public async warmup(): Promise<EditorType> {
    return this.detect();
  }

  private async getAllCommands(): Promise<Set<string>> {
    const now = Date.now();
    if (this.allCommandsCache && now - this.cacheTimestamp < this.CACHE_EXPIRY) {
      return this.allCommandsCache;
    }
    try {
      this.allCommandsCache = new Set(await vscode.commands.getCommands(true));
      this.cacheTimestamp   = now;
      return this.allCommandsCache;
    } catch (error) {
      console.error(`${LOG_PREFIX} Failed to get commands:`, error);
      return this.allCommandsCache ?? new Set();
    }
  }
}
