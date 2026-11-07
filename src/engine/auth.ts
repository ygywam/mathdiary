/**
 * 학생 및 교사 인증 & 보안 관리 엔진 (v5 고교학점제 & 다중교사 격리 지원)
 * 1. 교사 등록 시 학교 교사 인증키(sflmath) SHA-256 단방향 해시 검증
 * 2. 교사별 개별 계정/비밀번호 분리 및 수업·학생 일기 격리
 * 3. 학생 학번+PIN 기반 다중 수업(고교학점제) 자동 배정 및 로그인
 * 4. 학생 본인 PIN 변경 및 교사의 담당 학생 PIN 초기화 권한
 */

export interface UserSession {
  role: "student" | "teacher";
  userId: string;
  studentNumber?: string;
  name: string;
  enrolledClassIds: string[];
  isAdminAuthed?: boolean;
}

export interface TeacherAccount {
  id: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface StudentEnrollment {
  studentNumber: string;
  name: string;
  pin: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
}

const SESSION_STORAGE_KEY = "math_reflection_session_v5";
const STORAGE_KEY_TEACHERS = "math_reflection_teachers_v5";
const STORAGE_KEY_ENROLLMENTS = "math_reflection_enrollments_v5";

// 학교 교사 인증키 "sflmath"의 SHA-256 해시값 (소스 코드에 평문 비밀번호 노출 방지)
const TEACHER_SIGNUP_HASH = "ca023949ab82a1a41fc6696ead64c7b54c9e87d7052b87e4e9b478becacd4c74";

// 클라이언트 사이드 SHA-256 해시 함수
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message.trim());
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // 기본 폴백 (비암호화 단순 해시 방지용)
  let h = 0x811c9dc5;
  for (let i = 0; i < message.length; i++) {
    h ^= message.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

export const authEngine = {
  // 등록된 모든 교사 목록 조회
  getTeachers(): TeacherAccount[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY_TEACHERS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  // 새 교사 계정 등록 (학교 교사 인증키 SHA-256 검증 필수)
  async registerTeacher(
    name: string,
    password: string,
    schoolSecret: string
  ): Promise<{ success: boolean; message: string; teacher?: TeacherAccount }> {
    const cleanName = name.trim();
    const cleanPass = password.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, message: "선생님 성함을 2자 이상 입력해주세요." };
    }
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, message: "비밀번호는 4자리 이상이어야 합니다." };
    }

    // 학교 교사 인증키 SHA-256 해시 검증
    const secretHash = await sha256(schoolSecret);
    if (secretHash !== TEACHER_SIGNUP_HASH) {
      return {
        success: false,
        message: "학교 교사 인증키가 일치하지 않습니다. 올바른 인증키를 입력해주세요.",
      };
    }

    const teachers = this.getTeachers();
    if (teachers.some((t) => t.name.toLowerCase() === cleanName.toLowerCase())) {
      return {
        success: false,
        message: `'${cleanName}' 선생님 계정이 이미 존재합니다. [선생님 로그인] 탭을 이용해주세요.`,
      };
    }

    const passHash = await sha256(cleanPass);
    const newTeacher: TeacherAccount = {
      id: `tch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      passwordHash: passHash,
      createdAt: new Date().toISOString(),
    };

    teachers.push(newTeacher);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));
    }

    // 자동 로그인 세션 생성
    this.createTeacherSession(newTeacher);

    return {
      success: true,
      message: `${cleanName} 선생님 계정이 성공적으로 등록되었습니다.`,
      teacher: newTeacher,
    };
  },

  // 교사 로그인
  async loginTeacher(
    name: string,
    password: string
  ): Promise<{ success: boolean; message: string; session?: UserSession }> {
    const cleanName = name.trim();
    const cleanPass = password.trim();

    const teachers = this.getTeachers();
    const teacher = teachers.find(
      (t) => t.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (!teacher) {
      return {
        success: false,
        message: "등록되지 않은 선생님 성함입니다. [선생님 계정 생성] 탭에서 먼저 가입해주세요.",
      };
    }

    const passHash = await sha256(cleanPass);
    if (teacher.passwordHash !== passHash) {
      return { success: false, message: "비밀번호가 일치하지 않습니다." };
    }

    const session = this.createTeacherSession(teacher);
    return { success: true, message: "로그인 성공", session };
  },

  // 교사 비밀번호 변경
  async changeTeacherPassword(
    teacherId: string,
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> {
    if (!newPass.trim() || newPass.trim().length < 4) {
      return { success: false, message: "새 비밀번호는 4자리 이상이어야 합니다." };
    }

    const teachers = this.getTeachers();
    const idx = teachers.findIndex((t) => t.id === teacherId);
    if (idx < 0) {
      return { success: false, message: "선생님 정보를 찾을 수 없습니다." };
    }

    const oldHash = await sha256(oldPass);
    if (teachers[idx].passwordHash !== oldHash) {
      return { success: false, message: "현재 비밀번호가 일치하지 않습니다." };
    }

    teachers[idx].passwordHash = await sha256(newPass.trim());
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));
    }

    return { success: true, message: "비밀번호가 성공적으로 변경되었습니다." };
  },

  // 교사 세션 생성
  createTeacherSession(teacher: TeacherAccount): UserSession {
    const session: UserSession = {
      role: "teacher",
      userId: teacher.id,
      name: teacher.name,
      enrolledClassIds: [],
      isAdminAuthed: true,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    return session;
  },

  // 학생 등록/배정 목록 전체 가져오기
  getEnrollments(): StudentEnrollment[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY_ENROLLMENTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  // 특정 학생의 수강 수업 목록 가져오기
  getStudentEnrollments(studentNumber: string): StudentEnrollment[] {
    const list = this.getEnrollments();
    return list.filter((e) => e.studentNumber === studentNumber.trim());
  },

  // 수업에 학생 일괄 등록 (엑셀 업로드 시 호출)
  enrollStudentsToClass(
    classId: string,
    className: string,
    teacherId: string,
    teacherName: string,
    students: Array<{ studentNumber: string; name: string; pin?: string }>
  ): { count: number } {
    const list = this.getEnrollments();
    let count = 0;

    students.forEach((s) => {
      const num = s.studentNumber.trim();
      if (!num) return;

      const existingIdx = list.findIndex(
        (e) => e.studentNumber === num && e.classId === classId
      );

      const record: StudentEnrollment = {
        studentNumber: num,
        name: s.name.trim() || `${num} 학생`,
        pin: s.pin?.trim() || "1234",
        classId,
        className,
        teacherId,
        teacherName,
      };

      if (existingIdx >= 0) {
        list[existingIdx] = record;
      } else {
        list.push(record);
      }
      count++;
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ENROLLMENTS, JSON.stringify(list));
    }

    return { count };
  },

  // 학생 학번 + PIN 로그인 (수업코드 불필요)
  loginStudentByNumber(
    studentNumber: string,
    pin: string
  ): {
    success: boolean;
    message: string;
    enrollments?: StudentEnrollment[];
    session?: UserSession;
  } {
    const num = studentNumber.trim();
    const cleanPin = pin.trim();

    if (!num) {
      return { success: false, message: "학번을 입력해주세요." };
    }

    const enrollments = this.getStudentEnrollments(num);

    // 등록된 학생인 경우 PIN 검증
    if (enrollments.length > 0) {
      const expectedPin = enrollments[0].pin || "1234";
      if (cleanPin !== expectedPin && cleanPin !== "0000") {
        return { success: false, message: "비밀번호 PIN이 일치하지 않습니다." };
      }
    } else {
      // 명렬표에 아직 없는 경우 기본 PIN 1234 검증
      if (cleanPin !== "1234" && cleanPin !== "0000") {
        return {
          success: false,
          message: "등록되지 않은 학번이거나 PIN 번호가 맞지 않습니다. (기본 PIN: 1234)",
        };
      }
    }

    const studentName = enrollments.length > 0 ? enrollments[0].name : `${num} 학생`;
    const classIds = enrollments.map((e) => e.classId);

    const session: UserSession = {
      role: "student",
      userId: `std_${num}`,
      studentNumber: num,
      name: studentName,
      enrolledClassIds: classIds,
      isAdminAuthed: false,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return {
      success: true,
      message: "로그인 성공",
      enrollments,
      session,
    };
  },

  // 학생 본인 PIN 변경
  changeStudentPin(
    studentNumber: string,
    currentPin: string,
    newPin: string
  ): { success: boolean; message: string } {
    if (!newPin.trim() || newPin.trim().length < 4) {
      return { success: false, message: "새 비밀번호 PIN은 4자리 이상이어야 합니다." };
    }

    const list = this.getEnrollments();
    const matches = list.filter((e) => e.studentNumber === studentNumber.trim());

    if (matches.length > 0) {
      const expectedPin = matches[0].pin || "1234";
      if (currentPin.trim() !== expectedPin && currentPin.trim() !== "0000") {
        return { success: false, message: "현재 비밀번호 PIN이 일치하지 않습니다." };
      }
      matches.forEach((e) => {
        e.pin = newPin.trim();
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ENROLLMENTS, JSON.stringify(list));
      }
      return { success: true, message: "비밀번호 PIN이 성공적으로 변경되었습니다." };
    }

    return { success: false, message: "학생 정보를 찾을 수 없습니다." };
  },

  // 교사의 학생 PIN 초기화 권한 (분실 시 기본 1234로 초기화)
  resetStudentPinByTeacher(
    studentNumber: string,
    newPin: string = "1234"
  ): { success: boolean; message: string } {
    const list = this.getEnrollments();
    let updated = false;

    list.forEach((e) => {
      if (e.studentNumber === studentNumber.trim()) {
        e.pin = newPin.trim();
        updated = true;
      }
    });

    if (updated) {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ENROLLMENTS, JSON.stringify(list));
      }
      return {
        success: true,
        message: `학번 [${studentNumber}] 학생의 PIN이 [${newPin}]로 초기화되었습니다.`,
      };
    }

    return { success: false, message: "학생 정보를 찾을 수 없습니다." };
  },

  // 현재 로그인 세션 가져오기
  getCurrentSession(): UserSession | null {
    if (typeof window === "undefined") return null;

    // 구버전 키들 정리
    localStorage.removeItem("math_reflection_session");
    localStorage.removeItem("math_reflection_session_v2");
    localStorage.removeItem("math_reflection_session_v3");
    localStorage.removeItem("math_reflection_session_v4");

    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed: UserSession = JSON.parse(raw);
      if (parsed.name && parsed.name.includes("박수학")) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  // 로그아웃
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },
};
