import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminDashboardStats } from '@/utils/adminApi';

interface GalleryDetailTableProps {
  stats: AdminDashboardStats;
  isLoading: boolean;
}

const GalleryDetailTable: React.FC<GalleryDetailTableProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>갤러리 상세 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex justify-between p-3 bg-gray-50 rounded animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { usage_patterns } = stats;

  return (
    <Card>
      <CardHeader>
        <CardTitle>갤러리 사용량 상세</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 요약 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {usage_patterns.gallery_usage_stats.length}
              </div>
              <div className="text-sm text-gray-600">총 갤러리 수</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {usage_patterns.average_clients_per_gallery.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">평균 고객 수</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {usage_patterns.average_artworks_per_gallery.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">평균 작품 수</div>
            </div>
          </div>

          {/* 사용량별 분류 */}
          <div className="space-y-3">
            <h4 className="font-medium">사용량별 분류</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-red-600">
                    {usage_patterns.usage_distribution.no_data}
                  </div>
                  <div className="text-sm text-red-800">미사용 갤러리</div>
                  <div className="text-xs text-red-600">고객 0명</div>
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">
                    {usage_patterns.usage_distribution.light_users}
                  </div>
                  <div className="text-sm text-orange-800">가벼운 사용</div>
                  <div className="text-xs text-orange-600">고객 1-9명</div>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-600">
                    {usage_patterns.usage_distribution.medium_users}
                  </div>
                  <div className="text-sm text-yellow-800">중간 사용</div>
                  <div className="text-xs text-yellow-600">고객 10-50명</div>
                </div>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {usage_patterns.usage_distribution.heavy_users}
                  </div>
                  <div className="text-sm text-green-800">활발한 사용</div>
                  <div className="text-xs text-green-600">고객 50명+</div>
                </div>
              </div>
            </div>
          </div>

          {/* 개별 갤러리 정보 (상위 10개) */}
          <div className="space-y-3">
            <h4 className="font-medium">상위 활성 갤러리 (고객 수 기준)</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {usage_patterns.gallery_usage_stats
                .sort((a, b) => b.client_count - a.client_count)
                .slice(0, 10)
                .map((gallery, index) => (
                  <div key={gallery.gallery_id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">갤러리 ID: {gallery.gallery_id}</div>
                        <div className="text-sm text-gray-500">
                          가입: {gallery.created_days_ago}일 전 | 
                          방식: {gallery.signup_method === 'email' ? '이메일' : gallery.signup_method}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">고객 {gallery.client_count}명</div>
                        <div className="text-xs text-gray-500">
                          작품 {gallery.artwork_count}개 | 사용자 {gallery.user_count}명
                        </div>
                      </div>
                      
                      <Badge 
                        variant={
                          gallery.client_count >= 50 ? "default" : 
                          gallery.client_count >= 10 ? "secondary" : 
                          gallery.client_count > 0 ? "outline" : "destructive"
                        }
                      >
                        {gallery.client_count >= 50 ? "활발" : 
                         gallery.client_count >= 10 ? "중간" : 
                         gallery.client_count > 0 ? "가벼움" : "미사용"}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GalleryDetailTable;