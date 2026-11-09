import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import { glanceService } from '../services/glanceService';

export interface ArchivedJot {
  id: number;
  text: string;
  completed_at: number;
}

interface JotState {
  activeText: string;
  isGlanceActive: boolean;
  archivedJots: ArchivedJot[];
  isLoading: boolean;

  initDB: () => Promise<void>;
  setActiveText: (text: string) => void;
  toggleGlance: () => Promise<void>;
  completeActiveJot: () => Promise<void>;
  restoreJot: (jot: ArchivedJot) => Promise<void>;
  deleteArchivedJot: (id: number) => Promise<void>;
}

// In Expo SDK 51 / expo-sqlite v14, openDatabaseSync provides synchronous, zero-lag SQLite access
let dbInstance: SQLite.SQLiteDatabase | null = null;
let glanceDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('monojot.db');
  }
  return dbInstance;
}

export const useJotStore = create<JotState>((set, get) => ({
  activeText: '',
  isGlanceActive: true,
  archivedJots: [],
  isLoading: true,

  initDB: async () => {
    try {
      const db = getDb();

      // Table for the single active jot & archived vault
      db.execSync(`
        CREATE TABLE IF NOT EXISTS active_jot (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          text TEXT,
          is_glance INTEGER DEFAULT 1,
          updated_at INTEGER
        );
        CREATE TABLE IF NOT EXISTS archived_jots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT,
          completed_at INTEGER
        );
      `);

      // Initialize Glance service channel
      await glanceService.init();

      // Load active jot
      const activeRow = db.getFirstSync<{ text: string; is_glance: number }>(
        'SELECT text, is_glance FROM active_jot WHERE id = 1;'
      );

      if (activeRow) {
        const text = activeRow.text || '';
        const isGlance = activeRow.is_glance === 1;
        set({ activeText: text, isGlanceActive: isGlance });
        if (isGlance && text.trim()) {
          await glanceService.postGlance(text.trim());
        }
      } else {
        db.runSync(
          'INSERT INTO active_jot (id, text, is_glance, updated_at) VALUES (1, "", 1, ?);',
          [Date.now()]
        );
      }

      // Load archived jots
      const archivedRows = db.getAllSync<ArchivedJot>(
        'SELECT * FROM archived_jots ORDER BY completed_at DESC LIMIT 100;'
      );

      set({ archivedJots: archivedRows, isLoading: false });
    } catch (e) {
      console.warn('[JotStore] initDB error:', e);
      set({ isLoading: false });
    }
  },

  setActiveText: (text: string) => {
    set({ activeText: text });
    try {
      const db = getDb();
      db.runSync(
        'UPDATE active_jot SET text = ?, updated_at = ? WHERE id = 1;',
        [text, Date.now()]
      );
    } catch (e) {
      console.warn('[JotStore] setActiveText DB error:', e);
    }

    const { isGlanceActive } = get();
    if (isGlanceActive) {
      if (glanceDebounceTimer) {
        clearTimeout(glanceDebounceTimer);
        glanceDebounceTimer = null;
      }
      if (text.trim()) {
        glanceDebounceTimer = setTimeout(() => {
          glanceService.postGlance(text.trim());
        }, 300);
      } else {
        glanceService.clearGlance();
      }
    }
  },

  toggleGlance: async () => {
    if (glanceDebounceTimer) {
      clearTimeout(glanceDebounceTimer);
      glanceDebounceTimer = null;
    }

    const { isGlanceActive, activeText } = get();
    const nextState = !isGlanceActive;
    set({ isGlanceActive: nextState });

    try {
      const db = getDb();
      db.runSync(
        'UPDATE active_jot SET is_glance = ? WHERE id = 1;',
        [nextState ? 1 : 0]
      );
    } catch (e) {
      console.warn('[JotStore] toggleGlance DB error:', e);
    }

    if (nextState && activeText.trim()) {
      await glanceService.postGlance(activeText.trim());
    } else {
      await glanceService.clearGlance();
    }
  },

  completeActiveJot: async () => {
    if (glanceDebounceTimer) {
      clearTimeout(glanceDebounceTimer);
      glanceDebounceTimer = null;
    }

    const { activeText } = get();
    if (!activeText.trim()) return;

    const completedAt = Date.now();
    const textToArchive = activeText.trim();

    try {
      const db = getDb();

      // 1. Insert into archive
      const result = db.runSync(
        'INSERT INTO archived_jots (text, completed_at) VALUES (?, ?);',
        [textToArchive, completedAt]
      );

      // 2. Clear active jot
      db.runSync(
        'UPDATE active_jot SET text = "", updated_at = ? WHERE id = 1;',
        [completedAt]
      );

      // 3. Clear glance notification
      await glanceService.clearGlance();

      // 4. Update state with affirmative new item
      const newArchive: ArchivedJot = {
        id: result.lastInsertRowId,
        text: textToArchive,
        completed_at: completedAt,
      };

      set((state) => ({
        activeText: '',
        archivedJots: [newArchive, ...state.archivedJots],
      }));
    } catch (e) {
      console.warn('[JotStore] completeActiveJot error:', e);
    }
  },

  restoreJot: async (jot: ArchivedJot) => {
    const currentActive = get().activeText;
    const newText = currentActive.trim()
      ? `${currentActive}\n\n${jot.text}`
      : jot.text;

    get().setActiveText(newText);
    await get().deleteArchivedJot(jot.id);
  },

  deleteArchivedJot: async (id: number) => {
    try {
      const db = getDb();
      db.runSync('DELETE FROM archived_jots WHERE id = ?;', [id]);
    } catch (e) {
      console.warn('[JotStore] deleteArchivedJot DB error:', e);
    }

    set((state) => ({
      archivedJots: state.archivedJots.filter((j) => j.id !== id),
    }));
  },
}));
