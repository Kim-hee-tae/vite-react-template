import Database from 'better-sqlite3';
import path from 'path';

// 데이터베이스 파일 경로
const dbPath = path.join(process.cwd(), 'user-database.db');

// 데이터베이스 연결
let db: Database.Database;
try {
  db = new Database(dbPath);
} catch (error) {
  console.error('데이터베이스 연결 실패:', error);
  // 폴백: 메모리 데이터베이스 사용
  db = new Database(':memory:');
}

// 사용자 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_approved BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 데이터베이스 준비문
const statements = {
  // 사용자 생성
  createUser: db.prepare(`
    INSERT INTO users (email, password, role, is_approved)
    VALUES (?, ?, ?, ?)
  `),

  // 이메일로 사용자 조회
  getUserByEmail: db.prepare(`
    SELECT * FROM users WHERE email = ?
  `),

  // 모든 사용자 조회
  getAllUsers: db.prepare(`
    SELECT id, email, role, is_approved, created_at FROM users
  `),

  // 승인 대기 사용자 조회
  getPendingUsers: db.prepare(`
    SELECT id, email, role, created_at FROM users WHERE is_approved = 0
  `),

  // 승인된 사용자 조회
  getApprovedUsers: db.prepare(`
    SELECT id, email, role, created_at FROM users WHERE is_approved = 1
  `),

  // 사용자 승인
  approveUser: db.prepare(`
    UPDATE users SET is_approved = 1 WHERE email = ?
  `),

  // 사용자 삭제
  deleteUser: db.prepare(`
    DELETE FROM users WHERE email = ?
  `),

  // 관리자 계정 존재 확인
  hasAdmin: db.prepare(`
    SELECT COUNT(*) as count FROM users WHERE role = 'admin'
  `).pluck()
};

// 데이터베이스 함수들
export const dbFunctions = {
  // 사용자 생성
  createUser: (email: string, password: string, role: string = 'user', isApproved: boolean = false) => {
    try {
      const result = statements.createUser.run(email, password, role, isApproved ? 1 : 0);
      return { success: true, id: result.lastInsertRowid };
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return { success: false, error: '이미 존재하는 이메일입니다.' };
      }
      return { success: false, error: '사용자 생성 실패' };
    }
  },

  // 이메일로 사용자 조회
  getUserByEmail: (email: string) => {
    return statements.getUserByEmail.get(email);
  },

  // 모든 사용자 조회
  getAllUsers: () => {
    return statements.getAllUsers.all();
  },

  // 승인 대기 사용자 조회
  getPendingUsers: () => {
    return statements.getPendingUsers.all();
  },

  // 승인된 사용자 조회
  getApprovedUsers: () => {
    return statements.getApprovedUsers.all();
  },

  // 사용자 승인
  approveUser: (email: string) => {
    try {
      const result = statements.approveUser.run(email);
      return { success: result.changes > 0 };
    } catch (error) {
      return { success: false, error: '승인 실패' };
    }
  },

  // 사용자 삭제
  deleteUser: (email: string) => {
    try {
      const result = statements.deleteUser.run(email);
      return { success: result.changes > 0 };
    } catch (error) {
      return { success: false, error: '삭제 실패' };
    }
  },

  // 관리자 존재 확인
  hasAdmin: () => {
    return statements.hasAdmin.get() > 0;
  }
};

// 데이터베이스 연결 종료 함수 (필요시 사용)
export const closeDatabase = () => {
  db.close();
};