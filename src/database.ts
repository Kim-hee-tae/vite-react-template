import Database from 'better-sqlite3';
import path from 'path';
import type { D1Database, D1Result } from '@cloudflare/workers-types';

// 사용자 타입 정의
export interface User {
  id: number;
  email: string;
  password: string;
  role: string;
  is_approved: number;
  created_at: string;
}

// 로컬 개발용 SQLite 설정
const isWorkerEnvironment = typeof globalThis !== 'undefined' && 'fetch' in globalThis;
let sqliteDb: Database.Database | null = null;
if (!isWorkerEnvironment) {
  const dbPath = path.join(process.cwd(), 'user-database.db');
  try {
    sqliteDb = new Database(dbPath);
  } catch (error) {
    console.error('SQLite 연결 실패:', error);
    sqliteDb = new Database(':memory:');
  }
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      is_approved BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// D1 또는 SQLite 모두를 지원하는 함수 생성기
export function createDbFunctions(env?: { DB: D1Database }) {
  // D1 바인딩이 있는 경우
  if (env && env.DB) {
    const db = env.DB;
    // ensure table exists (migration)
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        is_approved BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    return {
      async createUser(email: string, password: string, role = 'user', isApproved = false) {
        try {
          const stmt = db.prepare(`INSERT INTO users (email, password, role, is_approved) VALUES (?, ?, ?, ?)`);
          const res = await stmt.bind(email, password, role, isApproved ? 1 : 0).run() as D1Result<unknown>;
          return { success: true, id: res.meta.last_row_id };
        } catch (e: any) {
          if (e.message.includes('UNIQUE')) {
            return { success: false, error: '이미 존재하는 이메일입니다.' };
          }
          return { success: false, error: '사용자 생성 실패' };
        }
      },

      async getUserByEmail(email: string): Promise<User | undefined> {
        const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
        const res = await stmt.bind(email).first<User>();
        return res as User | undefined;
      },

      async getPendingUsers(): Promise<Omit<User, 'password'>[]> {
        const stmt = db.prepare(`SELECT id, email, role, created_at FROM users WHERE is_approved = 0`);
        const rows = await stmt.all<Omit<User,'password'>>();
        return rows.results;
      },

      async getApprovedUsers(): Promise<Omit<User, 'password'>[]> {
        const stmt = db.prepare(`SELECT id, email, role, created_at FROM users WHERE is_approved = 1`);
        const rows = await stmt.all<Omit<User,'password'>>();
        return rows.results;
      },

      async approveUser(email: string) {
        const stmt = db.prepare(`UPDATE users SET is_approved = 1 WHERE email = ?`);
        const res = await stmt.bind(email).run() as D1Result<unknown>;
        return { success: res.meta.changes > 0 };
      },

      async deleteUser(email: string) {
        const stmt = db.prepare(`DELETE FROM users WHERE email = ?`);
        const res = await stmt.bind(email).run() as D1Result<unknown>;
        return { success: res.meta.changes > 0 };
      }
    };
  }

  // SQLite 로컬 버전
  return {
    createUser(email: string, password: string, role = 'user', isApproved = false) {
      if (!sqliteDb) throw new Error('SQLite DB 없음');
      try {
        const stmt = sqliteDb.prepare(`
          INSERT INTO users (email, password, role, is_approved) VALUES (?, ?, ?, ?)
        `);
        const result = stmt.run(email, password, role, isApproved ? 1 : 0);
        return { success: true, id: Number(result.lastInsertRowid) };
      } catch (e: any) {
        if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return { success: false, error: '이미 존재하는 이메일입니다.' };
        }
        return { success: false, error: '사용자 생성 실패' };
      }
    },

    getUserByEmail(email: string) {
      if (!sqliteDb) return undefined;
      return sqliteDb.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as User | undefined;
    },

    getPendingUsers() {
      if (!sqliteDb) return [];
      return sqliteDb.prepare(`SELECT id, email, role, created_at FROM users WHERE is_approved = 0`).all() as Omit<User, 'password'>[];
    },

    getApprovedUsers() {
      if (!sqliteDb) return [];
      return sqliteDb.prepare(`SELECT id, email, role, created_at FROM users WHERE is_approved = 1`).all() as Omit<User, 'password'>[];
    },

    approveUser(email: string) {
      if (!sqliteDb) return { success: false };
      const res = sqliteDb.prepare(`UPDATE users SET is_approved = 1 WHERE email = ?`).run(email);
      return { success: res.changes > 0 };
    },

    deleteUser(email: string) {
      if (!sqliteDb) return { success: false };
      const res = sqliteDb.prepare(`DELETE FROM users WHERE email = ?`).run(email);
      return { success: res.changes > 0 };
    }
  };
}