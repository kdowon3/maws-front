import React from "react";
import { ArtworkData, CaptionTemplateComponent } from "./index";
import SmartPrintPreview from "./SmartPrintPreview";
// import html2pdf from 'html2pdf.js'; // 상단 import 제거

interface PrintPreviewProps {
  artworks: ArtworkData[];
  template: CaptionTemplateComponent;
  templateName: string;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({
  artworks,
  template: TemplateComponent,
  templateName,
}) => {
  return (
    <SmartPrintPreview
      artworks={artworks}
      template={TemplateComponent}
      templateName={templateName}
    />
  );
};

export default PrintPreview;
