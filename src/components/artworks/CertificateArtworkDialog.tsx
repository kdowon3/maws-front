import React, { useEffect, useState } from "react";
import CertificateTemplate from "./CertificateTemplate";
import { Button } from "@/components/ui/button";
import { getGalleryInfo } from "@/utils/api";

interface CertificateArtworkDialogProps {
  artwork: any;
  onClose: () => void;
  isLoading?: boolean;
}

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

// 이미지 URL 보정 함수
const getFullImageUrl = (url: string) => {
  if (!url) return "/placeholder.png";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ""}${url}`;
};

const CertificateArtworkDialog: React.FC<CertificateArtworkDialogProps> = ({
  artwork,
  onClose,
  isLoading,
}) => {
  const [galleryInfo, setGalleryInfo] = useState<any>(null);

  useEffect(() => {
    const loadGalleryInfo = async () => {
      try {
        const info = await getGalleryInfo();
        setGalleryInfo(info);
      } catch (error) {
        console.error('갤러리 정보 로드 실패:', error);
      }
    };

    loadGalleryInfo();
  }, []);

  console.log("artwork.image:", artwork && artwork.image);
  if (!artwork) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto flex flex-col items-center">
        <CertificateTemplate
          date={getToday()}
          artist={artwork.artist}
          title={artwork.title}
          medium={artwork.medium}
          size={artwork.dimensions}
          year={artwork.year}
          imageUrl={getFullImageUrl(artwork.image)}
          galleryLogo={
            galleryInfo?.logo ? (
              <img
                src={galleryInfo.logo}
                alt={galleryInfo.name}
                style={{
                  height: '100px',
                  maxWidth: '300px',
                  objectFit: 'contain'
                }}
              />
            ) : (
              galleryInfo?.name || "갤러리 로고"
            )
          }
        />
        <div className="flex justify-end w-full mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CertificateArtworkDialog;
