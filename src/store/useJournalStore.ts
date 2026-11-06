/**
 * 성찰 일기 스토어 및 데이터 계층 (RLS 격리 원칙 적용)
 * LocalStorage 및 Supabase 클라우드 실시간 동기화 지원
 * 학생은 본인의 글만, 교사는 해당 수업의 전체 글만 열람 가능하도록 데이터 격리
 */

import { supabase, isSupabaseConfigured } from "@/engine/supabaseClient";

export interface ChapterInfo {
  major: string;
  minor: string;
  topic: string;
}

export interface ClassSession {
  id: string;
  teacherId: string;
  teacherName: string;
  name: string;             // 예: 1학년 1반 수학
  code: string;             // 고정 수업코드 (예: MTH-101)
  grade: string;            // 고등학교
  subject: string;          // 공통수학1
  activeChapter: ChapterInfo;
  createdAt: string;
}

export interface ReflectionAnswers {
  concept: string;          // 1. 배운 핵심 개념
  explained: string;        // 2. 친구에게 설명하기
  discovered: string;       // 3. 새롭게 알게 된 점 / 오개념
  plan: string;             // 4. 앞으로의 계획
}

export interface ReflectionEntry {
  id: string;
  classId: string;
  className: string;
  subject: string;
  teacherName: string;
  studentId: string;
  studentNumber: string;    // 예: 10101
  studentName: string;      // 예: 김수학
  date: string;             // YYYY-MM-DD
  chapter: ChapterInfo;
  answers: ReflectionAnswers;
  createdAt: string;
}

export interface RegisteredStudent {
  studentNumber: string;
  name: string;
  pin: string;
  classId: string;
  className: string;
}

const STORAGE_KEY_CLASSES = "math_reflection_classes_v2";
const STORAGE_KEY_ENTRIES = "math_reflection_entries_v2";
const STORAGE_KEY_STUDENTS = "math_reflection_students_v2";

// 초기 시뮬레이션용 데이터: 더미데이터 완전 제거 (0건 빈 배열)
const INITIAL_CLASSES: ClassSession[] = [];
const INITIAL_ENTRIES: ReflectionEntry[] = [];
const INITIAL_STUDENTS: RegisteredStudent[] = [];

export const journalStore = {
  // 전체 수업 목록 로드 (로컬 캐시)
  getClasses(): ClassSession[] {
    if (typeof window === "undefined") return INITIAL_CLASSES;
    const raw = localStorage.getItem(STORAGE_KEY_CLASSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(INITIAL_CLASSES));
      return INITIAL_CLASSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLASSES;
    }
  },

  // 수파베이스(Supabase) 클라우드에서 수업 목록 동기화
  async fetchClassesFromCloud(): Promise<ClassSession[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("classes")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: ClassSession[] = data.map((row: any) => ({
            id: row.id,
            teacherId: row.teacher || "교사",
            teacherName: row.teacher,
            name: row.name,
            code: row.code,
            grade: "고등학교",
            subject: row.subject,
            activeChapter: row.active_chapter || {
              major: "Ⅰ. 다항식",
              minor: "1. 다항식의 연산",
              topic: "다항식의 덧셈과 뺄셈",
            },
            createdAt: row.created_at ? row.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          }));

          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(mapped));
          }
          return mapped;
        }
      } catch (e) {
        console.warn("Supabase classes fetch error:", e);
      }
    }
    return this.getClasses();
  },

  // 수업 신규 개설 (로컬 + 수파베이스 클라우드 동시 저장)
  async addClass(newClass: ClassSession): Promise<void> {
    const list = this.getClasses();
    const updated = [newClass, ...list];
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(updated));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("classes").insert({
          id: newClass.id.startsWith("cls_") ? undefined : newClass.id,
          name: newClass.name,
          teacher: newClass.teacherName,
          subject: newClass.subject,
          code: newClass.code,
          active_chapter: newClass.activeChapter,
        });
      } catch (e) {
        console.warn("Supabase addClass insert error:", e);
      }
    }
  },

  // 수업코드(예: MTH-101)로 수업 찾기
  findClassByCode(code: string): ClassSession | undefined {
    const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
    return this.getClasses().find(
      (c) => c.code.replace(/\s+/g, "").toUpperCase() === normalized
    );
  },

  // 당일 활성 단원 변경
  async updateClassActiveChapter(classId: string, chapter: ChapterInfo): Promise<void> {
    const list = this.getClasses().map((c) =>
      c.id === classId ? { ...c, activeChapter: chapter } : c
    );
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(list));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("classes")
          .update({ active_chapter: chapter })
          .eq("id", classId);
      } catch (e) {
        console.warn("Supabase update active_chapter error:", e);
      }
    }
  },

  // 학생 명렬표 등록 (CSV 업로드 시 호출)
  registerStudentFallback(student: RegisteredStudent): void {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    const list: RegisteredStudent[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(
      (s) => s.studentNumber === student.studentNumber && s.classId === student.classId
    );
    if (idx >= 0) {
      list[idx] = student;
    } else {
      list.push(student);
    }
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(list));
  },

  // 전체 일기 레코드 로드 (로컬 캐시)
  getAllEntries(): ReflectionEntry[] {
    if (typeof window === "undefined") return INITIAL_ENTRIES;
    const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(INITIAL_ENTRIES));
      return INITIAL_ENTRIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ENTRIES;
    }
  },

  // 수파베이스(Supabase) 클라우드에서 일기 목록 동기화
  async fetchEntriesFromCloud(): Promise<ReflectionEntry[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("reflection_entries")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: ReflectionEntry[] = data.map((row: any) => ({
            id: row.id,
            classId: row.class_id,
            className: row.class_name || "수학 수업",
            subject: row.subject || "수학",
            teacherName: row.teacher || "선생님",
            studentId: row.student_number,
            studentNumber: row.student_number,
            studentName: row.student_name,
            date: row.date,
            chapter: row.chapter || { major: "", minor: "", topic: "" },
            answers: {
              concept: row.concept || "",
              explained: row.explained || "",
              discovered: row.discovered || "",
              plan: row.plan || "",
            },
            createdAt: row.created_at ? row.created_at.substring(0, 16).replace("T", " ") : "",
          }));

          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(mapped));
          }
          return mapped;
        }
      } catch (e) {
        console.warn("Supabase entries fetch error:", e);
      }
    }
    return this.getAllEntries();
  },

  // [학생 RLS 격리]: 학생 본인 글만 조회
  getStudentEntries(studentId: string): ReflectionEntry[] {
    return this.getAllEntries().filter((e) => e.studentId === studentId);
  },

  // [교사 RLS 격리]: 특정 수업에 제출된 일기 전체 조회
  getClassEntries(classId: string): ReflectionEntry[] {
    return this.getAllEntries().filter((e) => e.classId === classId);
  },

  // 성찰 일기 신규 저장 (로컬 + 수파베이스 클라우드 동시 영구 저장)
  async saveEntry(entry: ReflectionEntry): Promise<void> {
    const list = this.getAllEntries();
    const existingIndex = list.findIndex(
      (e) =>
        e.classId === entry.classId &&
        e.studentId === entry.studentId &&
        e.date === entry.date
    );

    let updated: ReflectionEntry[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = entry;
    } else {
      updated = [entry, ...list];
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(updated));
    }

    // Supabase 클라우드 DB INSERT
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("reflection_entries").insert({
          class_id: entry.classId.startsWith("cls_") ? null : entry.classId,
          student_number: entry.studentNumber,
          student_name: entry.studentName,
          date: entry.date,
          subject: entry.subject,
          teacher: entry.teacherName,
          class_name: entry.className,
          chapter: entry.chapter,
          concept: entry.answers.concept,
          explained: entry.answers.explained,
          discovered: entry.answers.discovered,
          plan: entry.answers.plan,
        });
      } catch (e) {
        console.warn("Supabase reflection_entries insert error:", e);
      }
    }
  },
};
