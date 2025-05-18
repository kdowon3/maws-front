
import { ClientStatus } from "../data/clientsData";

// 상태별 배지 스타일 정의
export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "VIP":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    case "구매자":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "장기고객":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "신규고객":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};
