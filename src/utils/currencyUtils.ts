
/**
 * 통화 금액을 포맷팅하는 함수
 * @param amount 포맷팅할 금액
 * @returns 포맷팅된 금액 문자열 (예: ₩5,000,000)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    currencyDisplay: 'symbol',
    maximumFractionDigits: 0
  }).format(amount);
};
