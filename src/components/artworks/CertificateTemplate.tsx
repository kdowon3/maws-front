import React from "react";

interface CertificateTemplateProps {
  date: string;
  artist: string;
  title: string;
  medium: string;
  size: string;
  year: string;
  imageUrl: string;
  galleryLogo?: React.ReactNode;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  date,
  artist,
  title,
  medium,
  size,
  year,
  imageUrl,
  galleryLogo,
}) => {
  return (
    <div
      className="certificate-template-print-root"
      style={{
        width: "210mm",
        height: "297mm",
        minWidth: "210mm",
        minHeight: "297mm",
        background: "#fff",
        margin: "0 auto",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: 'Arial, "맑은 고딕", sans-serif',
        position: "relative",
      }}
    >
      <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    .certificate-template-print-root, .certificate-template-print-root * {
                        visibility: visible !important;
                    }
                    .certificate-template-print-root {
                        position: absolute !important;
                        left: 0; top: 0;
                        width: 210mm !important;
                        height: 297mm !important;
                        min-width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        z-index: 9999;
                        page-break-after: avoid;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        overflow: hidden !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}</style>
      <div
        style={{
          width: "540px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            borderTop: "3px solid #222",
            borderBottom: "3px solid #222",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              fontSize: "38px",
              fontWeight: 500,
              letterSpacing: "0.04em",
              textAlign: "left",
              padding: "4px 0 4px 0",
              width: "100%",
            }}
          >
            CERTIFICATE
          </div>
        </div>
        <img
          src={imageUrl}
          alt="작품 이미지"
          style={{
            display: "block",
            margin: "0 auto 48px auto",
            maxWidth: "230px",
            maxHeight: "290px",
            objectFit: "cover",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        />
        <div style={{ width: "100%", marginBottom: "48px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: 0,
              fontSize: "18px",
            }}
          >
            <tbody
              style={{
                borderTop: "3px solid #222",
                borderBottom: "3px solid #222",
              }}
            >
              <tr>
                <th
                  style={{
                    width: "110px",
                    background: "#fff",
                    fontWeight: 500,
                    color: "#222",
                    padding: "16px 24px",
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1.5px solid #222",
                  }}
                >
                  Date
                </th>
                <td
                  style={{
                    background: "#fff",
                    padding: "16px 24px",
                    fontWeight: 400,
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1.5px solid #222",
                  }}
                >
                  발행일자
                </td>
                <td
                  style={{
                    background: "#fff",
                    padding: "16px 24px",
                    fontWeight: 400,
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "1.5px solid #222",
                  }}
                >
                  {date}
                </td>
              </tr>
              <tr>
                <th
                  style={{
                    width: "110px",
                    background: "#fff",
                    fontWeight: 500,
                    color: "#222",
                    padding: "16px 24px",
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  Artist
                </th>
                <td
                  style={{
                    background: "#fff",
                    padding: "16px 24px",
                    fontWeight: 400,
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  작가명
                </td>
                <td
                  style={{
                    background: "#fff",
                    padding: "16px 24px",
                    fontWeight: 400,
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  {artist}
                </td>
              </tr>
              <tr>
                <th
                  style={{
                    width: "110px",
                    background: "#fff",
                    fontWeight: 500,
                    color: "#222",
                    padding: "16px 24px",
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  Title
                </th>
                <td
                  style={{
                    background: "#fff",
                    padding: "16px 24px",
                    fontWeight: 400,
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  작품명
                </td>
                <td
                  style={{
                    background: "#fff",
                    padding: "16px 24px",
                    fontWeight: 400,
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  {title}
                </td>
              </tr>
              <tr>
                <th
                  style={{
                    width: "110px",
                    background: "#fff",
                    fontWeight: 500,
                    color: "#222",
                    padding: "16px 24px",
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  Medium
                </th>
                <td
                  style={{
                    background: "#fff",
                    padding: "16px 24px",
                    fontWeight: 400,
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  재료
                </td>
                <td
                  style={{
                    background: "#fff",
                    padding: "16px 24px",
                    fontWeight: 400,
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  {medium}
                </td>
              </tr>
              <tr>
                <th
                  style={{
                    width: "110px",
                    background: "#fff",
                    fontWeight: 500,
                    color: "#222",
                    padding: "16px 24px",
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  Size
                </th>
                <td
                  style={{
                    background: "#fff",
                    padding: "16px 24px",
                    fontWeight: 400,
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  크기
                </td>
                <td
                  style={{
                    background: "#fff",
                    padding: "16px 24px",
                    fontWeight: 400,
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                  }}
                >
                  {size}
                </td>
              </tr>
              <tr>
                <th
                  style={{
                    width: "110px",
                    background: "#fff",
                    fontWeight: 500,
                    color: "#222",
                    padding: "16px 24px",
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "3px solid #222",
                  }}
                >
                  Year
                </th>
                <td
                  style={{
                    background: "#fff",
                    padding: "16px 24px",
                    fontWeight: 400,
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "3px solid #222",
                  }}
                >
                  년도
                </td>
                <td
                  style={{
                    background: "#fff",
                    padding: "16px 24px",
                    fontWeight: 400,
                    fontSize: "18px",
                    textAlign: "left",
                    border: "none",
                    borderBottom: "3px solid #222",
                  }}
                >
                  {year}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: "18px",
            margin: "48px 0 18px 0",
            fontWeight: 500,
          }}
        >
          상기 작품이 진품임을 확인합니다.
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: "15px",
            color: "#444",
            marginBottom: "48px",
          }}
        >
          I guarantee the authenticity of this work.
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "48px",
            fontSize: "18px",
            width: "100%",
          }}
        >
          <div>{galleryLogo || "갤러리 로고"}</div>
          <div style={{ fontWeight: 500 }}>
            Artist's Signiture{" "}
            <span
              style={{
                display: "inline-block",
                borderBottom: "2px solid #222",
                width: "120px",
                marginLeft: "12px",
                verticalAlign: "baseline",
              }}
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
