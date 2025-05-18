
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// 날짜 포맷팅 유틸 함수
export const formatDate = (dateString: string, formatString = "yyyy년 MM월 dd일") => {
  return dateString ? format(new Date(dateString), formatString, { locale: ko }) : "-";
};

// 최근 방문일 포맷팅 유틸 함수
export const formatLastVisit = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "오늘";
  } else if (diffDays === 1) {
    return "어제";
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}주 전`;
  } else {
    return format(date, "yyyy년 MM월 dd일", { locale: ko });
  }
};
