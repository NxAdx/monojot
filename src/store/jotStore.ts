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

const db = SQLite.openDatabase('monojot.db');

export const useJotStore = create<JotState>((set, get) => ({
  activeText: '',
  isGlanceActive: true,
  archivedJots: [],
  isLoading: true,

  initDB: async () => {
    return new Promise((resolve) => {
      db.transaction((tx) => {
        // Table for the single active jot
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS active_jot (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            text TEXT,
            is_glance INTEGER DEFAULT 1,
            updated_at INTEGER
          );`
        );
        // Table for archived jots
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS archived_jots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT,
            completed_at INTEGER
          );`
        );
        // Load active jot
        tx.executeSql(
          `SELECT * FROM active_jot WHERE id = 1;`,
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              const item = rows.item(0);
              const text = item.text || '';
              const isGlance = item.is_glance === 1;
              set({ activeText: text, isGlanceActive: isGlance });
              if (isGlance && text.trim()) {
                glanceService.postGlance(text.trim());
              }
            } else {
              tx.executeSql(
                `INSERT INTO active_jot (id, text, is_glance, updated_at) VALUES (1, '', 1, ?);`,
                [Date.now()]
              );
            }
          }
        );
        // Load archived jots
        tx.executeSql(
          `SELECT * FROM archived_jots ORDER BY completed_at DESC LIMIT 100;`,
          [],
          (_, { rows }) => {
            const list: ArchivedJot[] = [];
            for (let i = 0; i < rows.length; i++) {
              list.push(rows.item(i));
            }
            set({ archivedJots: list, isLoading: false });
            resolve();
          }
        );
      });
    });
  },

  setActiveText: (text: string) => {
    set({ activeText: text });
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE active_jot SET text = ?, updated_at = ? WHERE id = 1;`,
        [text, Date.now()]
      );
    });

    const { isGlanceActive } = get();
    if (isGlanceActive) {
      if (text.trim()) {
        glanceService.postGlance(text.trim());
      } else {
        glanceService.clearGlance();
      }
    }
  },

  toggleGlance: async () => {
    const { isGlanceActive, activeText } = get();
    const nextState = !isGlanceActive;
    set({ isGlanceActive: nextState });

    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE active_jot SET is_glance = ? WHERE id = 1;`,
        [nextState ? 1 : 0]
      );
    });

    if (nextState && activeText.trim()) {
      await glanceService.postGlance(activeText.trim());
    } else {
      await glanceService.clearGlance();
    }
  },

  completeActiveJot: async () => {
    const { activeText } = get();
    if (!activeText.trim()) return;

    const completedAt = Date.now();
    return new Promise((resolve) => {
      db.transaction((tx) => {
        // Insert into archive
        tx.executeSql(
          `INSERT INTO archived_jots (text, completed_at) VALUES (?, ?);`,
          [activeText.trim(), completedAt],
          (_, result) => {
            const newArchive: ArchivedJot = {
              id: result.insertId || Date.now(),
              text: activeText.trim(),
              completed_at: completedAt,
            };
            set((state) => ({
              activeText: '',
              archivedJots: [newArchive, ...state.archivedJots],
            }));
          }
        );
        // Clear active jot
        tx.executeSql(
          `UPDATE active_jot SET text = '', updated_at = ? WHERE id = 1;`,
          [completedAt]
        );
      }, undefined, () => {
        glanceService.clearGlance();
        resolve();
      });
    });
  },

  restoreJot: async (jot: ArchivedJot) => {
    get().setActiveText(jot.text);
  },

  deleteArchivedJot: async (id: number) => {
    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM archived_jots WHERE id = ?;`, [id]);
    });
    set((state) => ({
      archivedJots: state.archivedJots.filter((j) => j.id !== id),
    }));
  },
}));

