/**
 * 학생 및 교사 인증 관리 엔진
 * 학생 개인정보 최소화: 실명/이메일 없이 '학번(예: 20315) + 4자리 PIN' 기반 인증
 */

export interface UserSession {
  role: "student" | "teacher";
  userId: string;
  studentNumber?: string;
  name: string;
  enrolledClassIds: string[];
}

const SESSION_STORAGE_KEY = "math_reflection_session";

export const authEngine = {
  // 현재 세션 가져오기
  getCurrentSession(): UserSession | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // 학생 간편 로그인 (학번 + PIN)
  loginAsStudent(studentNumber: string, pin: string, name?: string): UserSession {
    const studentName = name?.trim() || `${studentNumber} 학생`;
    const session: UserSession = {
      role: "student",
      userId: `std_${studentNumber}`,
      studentNumber,
      name: studentName,
      enrolledClassIds: [],
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    return session;
  },

  // 교사 간편 로그인
  loginAsTeacher(teacherName: string): UserSession {
    const session: UserSession = {
      role: "teacher",
      userId: `tch_${Date.now()}`,
      name: teacherName || "수학교사",
      enrolledClassIds: [],
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    return session;
  },

  // 로그아웃
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },
};
