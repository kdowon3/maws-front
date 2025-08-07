import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { fetchArtworkDetail } from '@/utils/api';
import CertificateTemplate from '@/components/artworks/CertificateTemplate';

export default function CertificatePage() {
    const router = useRouter();
    const { id } = router.query;
    const [artwork, setArtwork] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);
        fetchArtworkDetail(Number(id))
            .then((data) => setArtwork(data))
            .catch((err) => setError('작품 정보를 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!artwork) return null;

    return (
        <>
            <button
                onClick={() => window.print()}
                style={{
                    fontSize: 18,
                    padding: '8px 32px',
                    borderRadius: 6,
                    border: '1px solid #bbb',
                    background: '#f7f7f7',
                    cursor: 'pointer',
                    display: 'block',
                    margin: '32px auto',
                }}
                className="no-print"
            >
                인쇄 / PDF 저장
            </button>
            <CertificateTemplate
                date={artwork.date || ''}
                artist={artwork.artist_ko || artwork.artist_en || '-'}
                title={artwork.title_ko || artwork.title_en || '-'}
                medium={artwork.medium || '-'}
                size={artwork.size || '-'}
                year={artwork.year || '-'}
                imageUrl={artwork.image || '/logo.png'}
            />
            <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .certificate-a4-root, .certificate-a4-root * {
            visibility: visible !important;
          }
          .certificate-a4-root {
            position: absolute !important;
            left: 0; top: 0;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            z-index: 9999;
            page-break-after: avoid;
            display: block !important;
            overflow: hidden !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
        </>
    );
}
