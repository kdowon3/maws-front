import CaptionTemplate1 from "./CaptionTemplate1";
import CaptionTemplate2 from "./CaptionTemplate2";
import CaptionTemplate3 from "./CaptionTemplate3";
import CaptionTemplate4 from "./CaptionTemplate4";
import CaptionTemplate5 from "./CaptionTemplate5";
import CaptionTemplate6 from "./CaptionTemplate6";
import CaptionTemplate7 from "./CaptionTemplate7";
import CaptionTemplate8 from "./CaptionTemplate8";
import PrintPreview from "./PrintPreview";

export interface ArtworkData {
  id: string;
  title_ko: string;
  title_en?: string;
  artist_ko: string;
  artist_en?: string;
  year?: string;
  height?: number;
  width?: number;
  depth?: number;
  size_unit?: string;
  medium?: string;
  price?: number;
  image?: string;
  note?: string;
  buyer_detail?: {
    name: string;
    phone: string;
  };
}

export type CaptionTemplateComponent = React.ComponentType<{
  artwork: ArtworkData;
}>;

export const TEMPLATES = {
  1: CaptionTemplate1,
  2: CaptionTemplate2,
  3: CaptionTemplate3,
  4: CaptionTemplate4,
  5: CaptionTemplate5,
  6: CaptionTemplate6,
  7: CaptionTemplate7,
  8: CaptionTemplate8,
} as const;

export const TEMPLATE_NAMES = {
  1: "템플릿 1",
  2: "템플릿 2",
  3: "템플릿 3",
  4: "템플릿 4",
  5: "템플릿 5",
  6: "템플릿 6",
  7: "템플릿 7",
  8: "템플릿 8",
} as const;

export {
  CaptionTemplate1,
  CaptionTemplate2,
  CaptionTemplate3,
  CaptionTemplate4,
  CaptionTemplate5,
  CaptionTemplate6,
  CaptionTemplate7,
  CaptionTemplate8,
  PrintPreview,
};
