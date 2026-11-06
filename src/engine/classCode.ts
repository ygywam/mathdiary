/**
 * 고정 수업코드 발급 및 유효성 검증 엔진
 * 교실 프로젝터나 휴대폰에서 혼동하기 쉬운 문자(0, O, 1, I)를 제외한 6자리 코드 생성
 */

const SAFE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export const classCodeEngine = {
  // 6자리 난수 수업코드 생성 (예: MTH-782 또는 K9R4W2)
  generateCode(prefix = "MTH"): string {
    let result = "";
    for (let i = 0; i < 3; i++) {
      result += SAFE_CHARS.charAt(Math.floor(Math.random() * SAFE_CHARS.length));
    }
    return `${prefix}-${result}`;
  },

  // 코드 형식 정규화 (대문자 변환, 공백 및 하이픈 정리)
  normalizeCode(code: string): string {
    return code.trim().toUpperCase().replace(/\s+/g, "");
  },
};
