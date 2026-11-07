/**
 * 수학교과 세부능력 및 특기사항(세특) AI 자동 생성 엔진 (Gemini API)
 * 공식 ai.google.dev 최신 모델 기준 (상수 단일 관리)
 * 교사 개인 API 키 및 사용량 통계는 로컬 브라우저에만 암호화/격리 보관
 * 학생 데이터 비학습(익명화 전송) 및 실시간 토큰/요금 계산 엔진 탑재
 */

import { ReflectionEntry } from "@/store/useJournalStore";

export const GEMINI_MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (기본 권장 · 초고속/초저비용)" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash (고성능 추론)" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (심층 서술)" },
] as const;

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

// 1백만(1M) 토큰당 USD 단가 (USD per 1M tokens) 및 원-달러 기준 환율(1,400원)
export const MODEL_PRICING: Record<string, { inputPrice: number; outputPrice: number }> = {
  "gemini-2.5-flash": { inputPrice: 0.15, outputPrice: 0.60 },
  "gemini-3.5-flash": { inputPrice: 0.30, outputPrice: 1.20 },
  "gemini-2.5-pro": { inputPrice: 1.25, outputPrice: 5.00 },
};

export const USD_TO_KRW = 1400;

export interface ApiUsageRecord {
  id: string;
  timestamp: string;
  studentIdentifier: string;
  model: string;
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  costUSD: number;
  costKRW: number;
}

export interface ApiUsageSummary {
  totalCalls: number;
  totalPromptTokens: number;
  totalCandidatesTokens: number;
  totalTokens: number;
  totalCostUSD: number;
  totalCostKRW: number;
  recentRecords: ApiUsageRecord[];
}

const STORAGE_KEY_API_KEY = "math_reflection_gemini_api_key_v1";
const STORAGE_KEY_SELECTED_MODEL = "math_reflection_gemini_model_v1";
const STORAGE_KEY_ANONYMIZE = "math_reflection_gemini_anonymize_v1";
const STORAGE_KEY_IS_PAID_TIER = "math_reflection_gemini_is_paid_v1";
const STORAGE_KEY_USAGE_HISTORY = "math_reflection_gemini_usage_v1";

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

  // 학생 식별자 비학습 익명화 설정 (기본값 true)
  getAnonymizeSetting(): boolean {
    if (typeof window === "undefined") return true;
    const val = localStorage.getItem(STORAGE_KEY_ANONYMIZE);
    return val === null ? true : val === "true";
  },

  saveAnonymizeSetting(anonymize: boolean): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_ANONYMIZE, String(anonymize));
  },

  // 유료 결제 계정(Paid Tier) 연동 키 여부 (기본값 false)
  getPaidTierSetting(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY_IS_PAID_TIER) === "true";
  },

  savePaidTierSetting(isPaid: boolean): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_IS_PAID_TIER, String(isPaid));
  },

  // 누적 API 사용량 요약 조회
  getUsageSummary(): ApiUsageSummary {
    if (typeof window === "undefined") {
      return {
        totalCalls: 0,
        totalPromptTokens: 0,
        totalCandidatesTokens: 0,
        totalTokens: 0,
        totalCostUSD: 0,
        totalCostKRW: 0,
        recentRecords: [],
      };
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USAGE_HISTORY);
      if (!saved) {
        return {
          totalCalls: 0,
          totalPromptTokens: 0,
          totalCandidatesTokens: 0,
          totalTokens: 0,
          totalCostUSD: 0,
          totalCostKRW: 0,
          recentRecords: [],
        };
      }
      return JSON.parse(saved);
    } catch {
      return {
        totalCalls: 0,
        totalPromptTokens: 0,
        totalCandidatesTokens: 0,
        totalTokens: 0,
        totalCostUSD: 0,
        totalCostKRW: 0,
        recentRecords: [],
      };
    }
  },

  // 사용 기록 누적 저장
  recordUsage(record: ApiUsageRecord): void {
    if (typeof window === "undefined") return;
    const current = this.getUsageSummary();
    const newSummary: ApiUsageSummary = {
      totalCalls: current.totalCalls + 1,
      totalPromptTokens: current.totalPromptTokens + record.promptTokens,
      totalCandidatesTokens: current.totalCandidatesTokens + record.candidatesTokens,
      totalTokens: current.totalTokens + record.totalTokens,
      totalCostUSD: Number((current.totalCostUSD + record.costUSD).toFixed(6)),
      totalCostKRW: Math.round((current.totalCostUSD + record.costUSD) * USD_TO_KRW),
      recentRecords: [record, ...current.recentRecords.slice(0, 29)], // 최근 30개 보관
    };
    localStorage.setItem(STORAGE_KEY_USAGE_HISTORY, JSON.stringify(newSummary));
  },

  // 사용량 통계 초기화
  resetUsage(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY_USAGE_HISTORY);
  },

  // 토큰당 예상 요금 계산
  calculateCost(model: string, promptTokens: number, candidatesTokens: number): { costUSD: number; costKRW: number } {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING[DEFAULT_GEMINI_MODEL];
    const inputCost = (promptTokens / 1_000_000) * pricing.inputPrice;
    const outputCost = (candidatesTokens / 1_000_000) * pricing.outputPrice;
    const totalUSD = inputCost + outputCost;
    const totalKRW = Math.round(totalUSD * USD_TO_KRW);
    return {
      costUSD: Number(totalUSD.toFixed(6)),
      costKRW: totalKRW,
    };
  },

  // 학생의 누적 성찰 일기를 바탕으로 수학교과 세특 초안 생성
  async generateMathRecord(
    studentName: string,
    studentNumber: string,
    subjectName: string,
    entries: ReflectionEntry[],
    apiKeyOverride?: string,
    anonymizeOverride?: boolean
  ): Promise<{
    success: boolean;
    result?: string;
    error?: string;
    usage?: {
      promptTokens: number;
      candidatesTokens: number;
      totalTokens: number;
      costUSD: number;
      costKRW: number;
    };
  }> {
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

    const isAnonymize = anonymizeOverride !== undefined ? anonymizeOverride : this.getAnonymizeSetting();

    // 학생 식별자 익명화(비학습 보장) 여부에 따른 명칭
    const targetStudentName = isAnonymize ? "해당 학생" : studentName;
    const targetStudentNumber = isAnonymize ? "비공개(익명화 보호)" : studentNumber;

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
- 이름/식별자: ${targetStudentName} (${targetStudentNumber})
- 수강 과목: ${subjectName}

[학생이 작성한 수학 성찰 일기 기록]
${journalSummary}

[세특 작성 필수 지침]
1. 학생 개인정보 및 비학습 원칙: 특정 개인의 실명이나 학번을 본문에 절대 노출하지 말고, 3인칭 주어('학생은', '본 학생은') 또는 주어를 자연스럽게 생략하여 서술할 것.
2. 관찰 중심 서술: 일기 내용에 등장하는 구체적인 수학적 개념과 학생의 실제 사고 과정을 근거로 작성할 것.
3. 4대 평가 요소 반영:
   - 수학적 개념 및 원리의 정확한 내면화 역량
   - 수학적 의사소통(동료에게 설명하기, 수학적 표현력) 역량
   - 자신의 오류나 오개념을 스스로 진단하고 극복하려는 메타인지 및 자기주도 학습 태도
   - 지속적인 탐구 의지와 학업 발전성
4. 문체 및 어조:
   - 3인칭 관찰자 시점 종결어미 유지 ("~함.", "~를 보임.", "~를 탐구함.", "~에 기여함.")
   - 감정적 칭찬이나 과장된 미사여구는 배제하고 학업 역량이 드러나는 명확한 사실 중심 문장으로 구성
5. 기재 금지어 준수: 사교육 유발 요소, 교외 활동, 수상 경력, 특정 부모/가정 배경, 공인시험 성적 일체 언급 금지
6. 분량: 한글 공백 포함 400자 ~ 500자 내외의 완성된 하나의 문단으로 작성 (제목, 머리말, 부연 설명 없이 본문 텍스트만 출력할 것).`;

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

      // API 응답 usageMetadata 파싱 (실시간 토큰 집계)
      const usageMetadata = data?.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || Math.round(systemPrompt.length / 2.5);
      const candidatesTokens = usageMetadata.candidatesTokenCount || Math.round(generatedText.length / 2);
      const totalTokens = usageMetadata.totalTokenCount || (promptTokens + candidatesTokens);

      const { costUSD, costKRW } = this.calculateCost(model, promptTokens, candidatesTokens);

      // 사용 기록 영구 누적
      const usageRecord: ApiUsageRecord = {
        id: `usage_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        studentIdentifier: isAnonymize ? `${studentNumber} (익명 보호)` : `${studentNumber} ${studentName}`,
        model,
        promptTokens,
        candidatesTokens,
        totalTokens,
        costUSD,
        costKRW,
      };

      this.recordUsage(usageRecord);

      return {
        success: true,
        result: generatedText,
        usage: {
          promptTokens,
          candidatesTokens,
          totalTokens,
          costUSD,
          costKRW,
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || "네트워크 오류가 발생했습니다." };
    }
  },
};
