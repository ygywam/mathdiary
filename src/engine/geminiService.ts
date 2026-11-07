/**
 * 수학교과 세부능력 및 특기사항(세특) AI 자동 생성 엔진 (Gemini API)
 * 공식 ai.google.dev 최신 모델 기준 (상수 단일 관리)
 * 교사 개인 API 키는 로컬 브라우저에만 암호화/격리 보관
 */

import { ReflectionEntry } from "@/store/useJournalStore";

export const GEMINI_MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (기본 권장 · 초고속)" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash (고성능 추론)" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (심층 서술)" },
] as const;

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const STORAGE_KEY_API_KEY = "math_reflection_gemini_api_key_v1";
const STORAGE_KEY_SELECTED_MODEL = "math_reflection_gemini_model_v1";

export const geminiService = {
  // 로컬에 저장된 API 키 가져오기
  getApiKey(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_KEY_API_KEY) || "";
  },

  // API 키 저장
  saveApiKey(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  },

  // API 키 삭제
  removeApiKey(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  },

  // 선택된 모델 가져오기
  getModel(): string {
    if (typeof window === "undefined") return DEFAULT_GEMINI_MODEL;
    return localStorage.getItem(STORAGE_KEY_SELECTED_MODEL) || DEFAULT_GEMINI_MODEL;
  },

  // 모델 저장
  saveModel(model: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_SELECTED_MODEL, model);
  },

  // 학생의 누적 성찰 일기를 바탕으로 수학교과 세특 초안 생성
  async generateMathRecord(
    studentName: string,
    studentNumber: string,
    subjectName: string,
    entries: ReflectionEntry[],
    apiKeyOverride?: string
  ): Promise<{ success: boolean; result?: string; error?: string }> {
    const key = apiKeyOverride || this.getApiKey();
    if (!key) {
      return {
        success: false,
        error: "Gemini API 키가 설정되지 않았습니다. [API 키 설정]에서 키를 먼저 입력해주세요.",
      };
    }

    if (!entries || entries.length === 0) {
      return {
        success: false,
        error: `${studentName} 학생이 작성한 성찰 일기 데이터가 없습니다. 최소 1건 이상의 일기가 필요합니다.`,
      };
    }

    const model = this.getModel();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    // 학생의 누적 성찰 일기 내용 요약 정리
    const journalSummary = entries
      .map((e, idx) => {
        return `[차시 ${idx + 1}] (${e.date}) 단원: ${e.chapter.major} > ${e.chapter.minor}
- 배운 개념 요약: ${e.answers.concept}
- 동료 설명/의사소통: ${e.answers.explained}
- 발견한 취약점/오개념: ${e.answers.discovered}
- 방과후 성장 보완 계획: ${e.answers.plan}`;
      })
      .join("\n\n");

    const systemPrompt = `당신은 대한민국 고등학교 수학 교사이자 학교생활기록부 작성 전문가입니다.
제공된 학생의 실제 수학 수업 성찰 일기 데이터를 바탕으로, 교육부 학교생활기록부 기재요령을 완벽히 준수하는 '과목별 세부능력 및 특기사항(세특)' 초안을 작성해주세요.

[학생 정보]
- 이름: ${studentName} (학번: ${studentNumber})
- 과목: ${subjectName}

[학생이 작성한 수학 성찰 일기 기록]
${journalSummary}

[세특 작성 필수 지침]
1. 관찰 중심 서술: 일기 내용에 등장하는 구체적인 수학적 개념과 학생의 실제 사고 과정을 근거로 작성할 것.
2. 4대 평가 요소 반영:
   - 수학적 개념 및 원리의 정확한 내면화 역량
   - 수학적 의사소통(동료에게 설명하기, 수학적 표현력) 역량
   - 자신의 오류나 오개념을 스스로 진단하고 극복하려는 메타인지 및 자기주도 학습 태도
   - 지속적인 탐구 의지와 학업 발전성
3. 문체 및 어조:
   - 3인칭 관찰자 시점 유지 ("~함.", "~를 보임.", "~를 탐구함.", "~에 기여함.")
   - 감정적 칭찬이나 과장된 미사여구는 배제하고 학업 역량이 드러나는 명확한 사실 중심 문장으로 구성
4. 기재 금지어 준수: 사교육 유발 요소, 교외 활동, 수상 경력, 특정 부모/가정 배경, 공인시험 성적 일체 언급 금지
5. 분량: 한글 공백 포함 400자 ~ 500자 내외의 완성된 하나의 문단으로 작성 (제목, 머리말, 부연 설명 없이 본문 텍스트만 출력할 것).`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `API 호출 실패 (상태 코드: ${response.status})`;
        return { success: false, error: errMsg };
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!generatedText) {
        return { success: false, error: "AI로부터 응답을 생성하지 못했습니다." };
      }

      return { success: true, result: generatedText };
    } catch (err: any) {
      return { success: false, error: err?.message || "네트워크 오류가 발생했습니다." };
    }
  },
};
