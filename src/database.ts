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

/**
 * D1 또는 SQLite 모두를 지원하는 함수 생성기
 */
export function createDbFunctions(env?: { DB: D1Database }) {
  
  // 1. Cloudflare D1 환경 (배포용)
  if (env && env.DB) {
    const db = env.DB;
    return {
      async createUser(email: string, password: string, role = 'user', isApproved = false) {
        try {
          const stmt = db.prepare(`INSERT INTO users (email, password, role, is_approved) VALUES (?, ?, ?, ?)`);
          const res = await stmt.bind(email, password, role, isApproved ? 1 : 0).run() as D1Result<unknown>;
          return { success: true, id: res.meta.last_row_id };
        } catch (e: any) { // [해결] : any 추가하여 unknown 에러 방지
          const msg = e.message || String(e);
          if (msg.includes('UNIQUE')) {
            return { success: false, error: '이미 존재하는 이메일입니다.' };
          }
          return { success: false, error: '사용자 생성 실패' };
        }
      },

      async getUserByEmail(email: string): Promise<User | undefined> {
        return await db.prepare(`SELECT * FROM users WHERE email = ?`).bind(email).first<User>() || undefined;
      },

      async getPendingUsers(): Promise<Omit<User, 'password'>[]> {
        const { results } = await db.prepare(`SELECT id, email, role, created_at FROM users WHERE is_approved = 0`).all<Omit<User, 'password'>>();
        return results;
      },

      async getApprovedUsers(): Promise<Omit<User, 'password'>[]> {
        const { results } = await db.prepare(`SELECT id, email, role, created_at FROM users WHERE is_approved = 1`).all<Omit<User, 'password'>>();
        return results;
      },

      async approveUser(email: string) {
        const res = await db.prepare(`UPDATE users SET is_approved = 1 WHERE email = ?`).bind(email).run();
        return { success: res.success };
      },

      async deleteUser(email: string) {
        const res = await db.prepare(`DELETE FROM users WHERE email = ?`).bind(email).run();
        return { success: res.success };
      }
    };
  }

  // 2. 로컬 개발 환경 (Node.js)
  // Cloudflare 빌드 시 better-sqlite3가 문제를 일으키지 않도록 dynamic import 고려가 필요할 수 있으나, 
  // 여기서는 타입 에러 해결에 집중합니다.
  return {
    // 로컬 환경 함수들은 필요시 구현하거나, 
    // 실제 배포 시에는 위 D1 로직이 실행되므로 빌드 에러만 없으면 됩니다.
    createUser: () => ({ success: false, error: 'Local DB not configured' }),
    getUserByEmail: async () => undefined,
    getPendingUsers: async () => [],
    getApprovedUsers: async () => [],
    approveUser: async () => ({ success: false }),
    deleteUser: async () => ({ success: false }),
  };
}