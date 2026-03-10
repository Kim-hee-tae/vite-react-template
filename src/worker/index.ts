import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { dbFunctions } from "../database";

const app = new Hono<{ Bindings: Env }>();

// 기본 API
app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

// 회원 가입 API
app.post("/api/signup", async (c) => {
  try {
    const { email, password, role = 'user' } = await c.req.json();

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ success: false, error: "올바른 이메일 형식을 입력해주세요." }, 400);
    }

    // 비밀번호 규칙 검증
    const passwordRules = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    if (!passwordRules.minLength || !passwordRules.hasUpperCase || !passwordRules.hasSpecialChar) {
      return c.json({
        success: false,
        error: "비밀번호는 8자 이상, 대문자, 특수문자를 포함해야 합니다."
      }, 400);
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 관리자 계정 체크
    const isAdmin = email === 'admin@admin.com';
    const userRole = isAdmin ? 'admin' : role;
    const isApproved = isAdmin ? true : false;

    // 사용자 생성
    const result = dbFunctions.createUser(email, hashedPassword, userRole, isApproved);

    if (result.success) {
      return c.json({
        success: true,
        message: isAdmin ? "관리자 계정 생성 완료!" : "회원 가입 성공! 관리자 승인 후 로그인할 수 있습니다."
      });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error) {
    return c.json({ success: false, error: "서버 오류" }, 500);
  }
});

// 로그인 API
app.post("/api/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    const user = dbFunctions.getUserByEmail(email);
    if (!user) {
      return c.json({ success: false, error: "이메일 또는 비밀번호가 잘못되었습니다." }, 401);
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return c.json({ success: false, error: "이메일 또는 비밀번호가 잘못되었습니다." }, 401);
    }

    // 승인 상태 확인
    if (!user.is_approved) {
      return c.json({ success: false, error: "관리자 승인 대기 중입니다." }, 403);
    }

    // 비밀번호 제외하고 사용자 정보 반환
    const { password: _, ...userInfo } = user;
    return c.json({ success: true, user: userInfo });
  } catch (error) {
    return c.json({ success: false, error: "서버 오류" }, 500);
  }
});

// 승인 대기 사용자 목록 조회 (관리자 전용)
app.get("/api/admin/pending-users", (c) => {
  try {
    const users = dbFunctions.getPendingUsers();
    return c.json({ success: true, users });
  } catch (error) {
    return c.json({ success: false, error: "서버 오류" }, 500);
  }
});

// 승인된 사용자 목록 조회 (관리자 전용)
app.get("/api/admin/approved-users", (c) => {
  try {
    const users = dbFunctions.getApprovedUsers();
    return c.json({ success: true, users });
  } catch (error) {
    return c.json({ success: false, error: "서버 오류" }, 500);
  }
});

// 사용자 승인 (관리자 전용)
app.post("/api/admin/approve-user", async (c) => {
  try {
    const { email } = await c.req.json();
    const result = dbFunctions.approveUser(email);
    if (result.success) {
      return c.json({ success: true, message: "사용자가 승인되었습니다." });
    } else {
      return c.json({ success: false, error: "승인 실패" }, 400);
    }
  } catch (error) {
    return c.json({ success: false, error: "서버 오류" }, 500);
  }
});

// 사용자 삭제 (관리자 전용)
app.delete("/api/admin/delete-user", async (c) => {
  try {
    const { email } = await c.req.json();
    const result = dbFunctions.deleteUser(email);
    if (result.success) {
      return c.json({ success: true, message: "사용자가 삭제되었습니다." });
    } else {
      return c.json({ success: false, error: "삭제 실패" }, 400);
    }
  } catch (error) {
    return c.json({ success: false, error: "서버 오류" }, 500);
  }
});

export default app;
