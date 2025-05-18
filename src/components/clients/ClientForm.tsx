
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// 유효성 검증 스키마
const formSchema = z.object({
  name: z.string().min(2, { message: "이름은 2글자 이상이어야 합니다." }),
  phone: z.string().min(10, { message: "유효한 전화번호를 입력해주세요." }),
  email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
  favoriteArtists: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// 작가 및 상태 옵션
const artistOptions = ["김작가", "이작가", "박작가", "최작가"];
const statusOptions = [
  { id: "vip", label: "VIP" },
  { id: "buyer", label: "구매자" },
  { id: "longterm", label: "장기고객" },
  { id: "new", label: "신규고객" },
];

interface ClientFormProps {
  onSubmit: (data: any) => void;
  initialValues?: any;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, initialValues = {} }) => {
  // 폼 초기화
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialValues.name || "",
      phone: initialValues.phone || "",
      email: initialValues.email || "",
      favoriteArtists: initialValues.favoriteArtists || [],
      status: initialValues.status || [],
      notes: initialValues.notes || "",
    },
  });

  // 폼 제출 핸들러
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    toast.success("고객 정보가 저장되었습니다");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 이름 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>고객명 *</FormLabel>
                <FormControl>
                  <Input placeholder="고객 이름을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 연락처 */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>연락처 *</FormLabel>
                <FormControl>
                  <Input placeholder="010-0000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* 이메일 */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>이메일 *</FormLabel>
                <FormControl>
                  <Input placeholder="example@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* 관심 작가 */}
        <div>
          <FormLabel>관심 작가</FormLabel>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {artistOptions.map((artist) => (
              <FormField
                key={artist}
                control={form.control}
                name="favoriteArtists"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(artist)}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          return checked
                            ? field.onChange([...currentValues, artist])
                            : field.onChange(
                                currentValues.filter((value) => value !== artist)
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">{artist}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
        
        {/* 고객 상태 */}
        <div>
          <FormLabel>고객 상태</FormLabel>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {statusOptions.map((status) => (
              <FormField
                key={status.id}
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(status.label)}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          return checked
                            ? field.onChange([...currentValues, status.label])
                            : field.onChange(
                                currentValues.filter((value) => value !== status.label)
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">{status.label}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
        
        {/* 비고 */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비고</FormLabel>
              <FormControl>
                <textarea
                  className="w-full h-24 px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="고객 관련 메모를 입력하세요"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onSubmit(null)}>
            취소
          </Button>
          <Button type="submit" className="bg-brand-blue hover:bg-brand-lightBlue">
            저장
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;
