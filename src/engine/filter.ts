/**
 * 교사용 다차원 3단 필터링 엔진
 * 날짜, 학생, 단원별 실시간 복합 필터링 및 학습 요약 통계 계산
 */

import { ReflectionEntry } from "../store/useJournalStore";

export interface FilterOptions {
  date?: string;          // 특정 일자 (YYYY-MM-DD)
  studentId?: string;     // 특정 학생 식별자
  majorChapter?: string;  // 대단원명
  minorChapter?: string;  // 중단원명
  searchQuery?: string;   // 학생 이름, 내용 검색어
}

export const filterEngine = {
  // 복합 조건 필터링
  filterEntries(entries: ReflectionEntry[], options: FilterOptions): ReflectionEntry[] {
    return entries.filter((entry) => {
      // 1. 날짜 필터
      if (options.date && options.date !== "all" && entry.date !== options.date) {
        return false;
      }

      // 2. 학생 필터
      if (options.studentId && options.studentId !== "all" && entry.studentId !== options.studentId) {
        return false;
      }

      // 3. 단원 필터 (대단원)
      if (options.majorChapter && options.majorChapter !== "all" && entry.chapter.major !== options.majorChapter) {
        return false;
      }

      // 4. 단원 필터 (중단원)
      if (options.minorChapter && options.minorChapter !== "all" && entry.chapter.minor !== options.minorChapter) {
        return false;
      }

      // 5. 검색어 필터 (학생 이름, 학번, 또는 4대 답변 내용)
      if (options.searchQuery && options.searchQuery.trim() !== "") {
        const query = options.searchQuery.toLowerCase();
        const matchesName = entry.studentName.toLowerCase().includes(query);
        const matchesNumber = entry.studentNumber.toLowerCase().includes(query);
        const matchesAnswers =
          entry.answers.concept.toLowerCase().includes(query) ||
          entry.answers.explained.toLowerCase().includes(query) ||
          entry.answers.discovered.toLowerCase().includes(query) ||
          entry.answers.plan.toLowerCase().includes(query);

        if (!matchesName && !matchesNumber && !matchesAnswers) {
          return false;
        }
      }

      return true;
    });
  },

  // 고유 날짜 목록 추출 (최신순)
  getUniqueDates(entries: ReflectionEntry[]): string[] {
    const dates = Array.from(new Set(entries.map((e) => e.date)));
    return dates.sort((a, b) => b.localeCompare(a));
  },

  // 고유 대단원 목록 추출
  getUniqueMajorChapters(entries: ReflectionEntry[]): string[] {
    return Array.from(new Set(entries.map((e) => e.chapter.major))).filter(Boolean);
  },

  // 학생별 제출 통계
  getStudentStats(entries: ReflectionEntry[]): { studentId: string; name: string; number: string; count: number }[] {
    const map = new Map<string, { studentId: string; name: string; number: string; count: number }>();
    entries.forEach((e) => {
      const existing = map.get(e.studentId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(e.studentId, {
          studentId: e.studentId,
          name: e.studentName,
          number: e.studentNumber,
          count: 1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.number.localeCompare(b.number));
  },
};
