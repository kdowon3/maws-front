import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { User, Building2, Phone, Mail, Globe, CreditCard, Key, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getGalleryInfo, updateGalleryInfo, changePassword } from '@/utils/api';

// 갤러리 정보 폼 스키마
const galleryInfoSchema = z.object({
  name: z.string().min(1, '갤러리명은 필수입니다'),
  address: z.string().min(1, '주소는 필수입니다'),
  phone: z.string().min(1, '전화번호는 필수입니다'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  website: z.string().url('유효한 URL을 입력해주세요').optional().or(z.literal('')),
  business_number: z.string().optional(),
});

// 비밀번호 변경 폼 스키마
const passwordSchema = z.object({
  old_password: z.string().min(1, '현재 비밀번호를 입력해주세요'),
  new_password: z.string().min(8, '새 비밀번호는 8자 이상이어야 합니다'),
  new_password_confirm: z.string().min(1, '비밀번호 확인을 입력해주세요'),
}).refine((data) => data.new_password === data.new_password_confirm, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["new_password_confirm"],
});

type GalleryInfoForm = z.infer<typeof galleryInfoSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [galleryInfo, setGalleryInfo] = useState<any>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // 갤러리 정보 폼
  const galleryForm = useForm<GalleryInfoForm>({
    resolver: zodResolver(galleryInfoSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      business_number: '',
    },
  });

  // 비밀번호 변경 폼
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      new_password_confirm: '',
    },
  });

  // 로고 파일 처리 함수들
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    // 파일 형식 제한
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setLogoFile(file);
    
    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  // 갤러리 정보 로드
  useEffect(() => {
    const loadGalleryInfo = async () => {
      try {
        setLoading(true);
        const info = await getGalleryInfo();
        setGalleryInfo(info);
        
        // 기존 로고가 있으면 미리보기 설정
        console.log('[DEBUG] Gallery info received:', info);
        console.log('[DEBUG] Logo URL from backend:', info.logo);
        
        if (info.logo) {
          console.log('[DEBUG] Setting logo preview to:', info.logo);
          setLogoPreview(info.logo);
        } else {
          console.log('[DEBUG] No logo found in gallery info');
        }
        
        // 폼에 기존 정보 설정
        galleryForm.reset({
          name: info.name || '',
          address: info.address || '',
          phone: info.phone || '',
          email: info.email || '',
          website: info.website || '',
          business_number: info.business_number || '',
        });
      } catch (error) {
        console.error('갤러리 정보 로드 실패:', error);
        toast.error('갤러리 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadGalleryInfo();
  }, [galleryForm]);

  // 갤러리 정보 저장
  const handleGalleryInfoSubmit = async (data: GalleryInfoForm) => {
    try {
      setLoading(true);
      
      // FormData 생성 (파일 업로드를 위해)
      const formData = new FormData();
      
      // 기본 정보 추가
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
      
      // 로고 파일이 있으면 추가
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      const result = await updateGalleryInfo(formData);
      console.log('[DEBUG] Update result:', result);
      console.log('[DEBUG] Updated logo URL:', result.logo);
      
      setGalleryInfo(result);
      
      // 새 로고가 업로드된 경우 미리보기 업데이트
      if (result.logo) {
        console.log('[DEBUG] Setting updated logo preview to:', result.logo);
        setLogoPreview(result.logo);
      } else {
        console.log('[DEBUG] No logo in update result');
      }
      
      setLogoFile(null); // 업로드 완료 후 파일 상태 초기화
      toast.success('갤러리 정보가 성공적으로 업데이트되었습니다.');
      alert('갤러리 정보가 성공적으로 변경되었습니다!');
    } catch (error) {
      console.error('갤러리 정보 업데이트 실패:', error);
      toast.error('갤러리 정보 업데이트에 실패했습니다.');
      alert('갤러리 정보 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 변경
  const handlePasswordSubmit = async (data: PasswordForm) => {
    try {
      setLoading(true);
      await changePassword(data);
      passwordForm.reset();
      toast.success('비밀번호가 성공적으로 변경되었습니다.');
      alert('비밀번호가 성공적으로 변경되었습니다!');
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      toast.error('비밀번호 변경에 실패했습니다.');
      alert('비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">갤러리 설정</h1>
          <p className="text-gray-600">갤러리 정보와 계정 설정을 관리하세요</p>
        </div>

        {/* 갤러리 정보 카드 */}
        {galleryInfo && (
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  {galleryInfo.logo ? (
                    <img
                      src={galleryInfo.logo}
                      alt={galleryInfo.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">{galleryInfo.name}</CardTitle>
                  <p className="text-sm text-gray-600">
                    가입일: {new Date(galleryInfo.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* 탭 메뉴 */}
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              갤러리 정보
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              비밀번호 변경
            </TabsTrigger>
          </TabsList>

          {/* 갤러리 정보 탭 */}
          <TabsContent value="gallery" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <p className="text-sm text-gray-600">갤러리의 기본 정보를 관리하세요</p>
              </CardHeader>
              <CardContent>
                <Form {...galleryForm}>
                  <form 
                    onSubmit={galleryForm.handleSubmit(handleGalleryInfoSubmit)} 
                    className="space-y-6"
                  >
                    {/* 갤러리 로고 */}
                    <div className="space-y-4">
                      <FormLabel className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        갤러리 로고
                      </FormLabel>
                      
                      <div className="flex items-start gap-4">
                        {/* 로고 미리보기 */}
                        <div className="flex-shrink-0">
                          {logoPreview ? (
                            <div className="relative">
                              <img
                                src={logoPreview}
                                alt="갤러리 로고"
                                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={removeLogo}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                              <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* 파일 업로드 */}
                        <div className="flex-1 space-y-2">
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer border border-blue-200"
                          >
                            <Upload className="w-4 h-4" />
                            로고 업로드
                          </label>
                          <p className="text-xs text-gray-500">
                            JPG, PNG 파일 (최대 5MB)
                          </p>
                          {logoFile && (
                            <p className="text-xs text-green-600">
                              새 파일: {logoFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />

                    {/* 갤러리명 */}
                    <FormField
                      control={galleryForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            갤러리명 *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="갤러리 이름을 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 주소 */}
                    <FormField
                      control={galleryForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>주소 *</FormLabel>
                          <FormControl>
                            <Input placeholder="갤러리 주소를 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 전화번호 */}
                      <FormField
                        control={galleryForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              전화번호 *
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="010-0000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 이메일 */}
                      <FormField
                        control={galleryForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              이메일 *
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="gallery@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 웹사이트 */}
                      <FormField
                        control={galleryForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              웹사이트
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://gallery.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* 사업자등록번호 */}
                      <FormField
                        control={galleryForm.control}
                        name="business_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              사업자등록번호
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="000-00-00000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {loading ? '저장 중...' : '변경사항 저장'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 보안 설정 탭 */}
          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>비밀번호 변경</CardTitle>
                <p className="text-sm text-gray-600">계정의 비밀번호를 변경하세요</p>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form 
                    onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} 
                    className="space-y-6"
                  >
                    {/* 현재 비밀번호 */}
                    <FormField
                      control={passwordForm.control}
                      name="old_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>현재 비밀번호</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="현재 비밀번호를 입력하세요" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 새 비밀번호 */}
                    <FormField
                      control={passwordForm.control}
                      name="new_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>새 비밀번호</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="새 비밀번호를 입력하세요 (8자 이상)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 새 비밀번호 확인 */}
                    <FormField
                      control={passwordForm.control}
                      name="new_password_confirm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>새 비밀번호 확인</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="새 비밀번호를 다시 입력하세요" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {loading ? '변경 중...' : '비밀번호 변경'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}