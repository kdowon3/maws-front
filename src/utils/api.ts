const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// 토큰 갱신 함수
const refreshToken = async (): Promise<boolean> => {
  const refreshTokenValue = localStorage.getItem("refresh_token");
  if (!refreshTokenValue) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/accounts/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshTokenValue }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("access_token", data.access);
      // refresh 토큰은 그대로 유지
      if (data.user) {
        localStorage.setItem("user_data", JSON.stringify(data.user));
      }
      return true;
    }
  } catch (error) {
    console.error("토큰 갱신 실패:", error);
  }

  return false;
};

// 인증이 필요한 API 요청을 위한 공통 함수
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const token = localStorage.getItem("access_token");

  const config: RequestInit = {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  };

  let response = await fetch(url, config);

  // 401 에러 시 토큰 갱신 시도
  if (response.status === 401) {
    const refreshSuccess = await refreshToken();
    if (refreshSuccess) {
      // 새로운 토큰으로 재시도
      const newToken = localStorage.getItem("access_token");
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(url, config);
    } else {
      // 토큰 갱신 실패 시 로그아웃 처리
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      window.location.href = "/auth/login";
      throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
    }
  }

  return response;
};

// 인증 헤더를 포함한 공통 헤더 생성
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// FormData용 인증 헤더 (Content-Type 제외)
const getAuthHeadersForFormData = () => {
  const token = localStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export async function fetchClients() {
  const res = await authenticatedFetch(`${API_BASE_URL}/clients/`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch clients");
  return res.json();
}

export async function fetchArtworks() {
  const res = await authenticatedFetch(`${API_BASE_URL}/artworks/`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch artworks");
  return res.json();
}

export async function createArtwork(data) {
  const res = await authenticatedFetch(`${API_BASE_URL}/artworks/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("작품 등록 실패");
  return res.json();
}

export async function updateArtwork(id, data) {
  const res = await authenticatedFetch(`${API_BASE_URL}/artworks/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("작품 수정 실패");
  return res.json();
}

export async function deleteArtwork(id) {
  const res = await authenticatedFetch(`${API_BASE_URL}/artworks/${id}/`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("작품 삭제 실패");
  return true;
}

export async function issueArtworkCertificate(id) {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/artworks/${id}/issue_certificate/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );
  if (!res.ok) throw new Error("보증서 발급 실패");
  return res.json();
}

export async function fetchClientDetail(id: number) {
  const res = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/${id}/`,
  );
  if (!res.ok) throw new Error("Failed to fetch client detail");
  return res.json();
}

export async function fetchArtworkDetail(id: number) {
  const res = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/artworks/${id}/`,
  );
  if (!res.ok) throw new Error("Failed to fetch artwork detail");
  return res.json();
}

export async function fetchClientsServerSide(params = {}) {
  // undefined/null 파라미터 제거
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null),
  );
  const query = new URLSearchParams(
    filtered as Record<string, string>,
  ).toString();
  const res = await authenticatedFetch(`${API_BASE_URL}/clients/?${query}`);
  if (!res.ok) throw new Error("Failed to fetch clients");
  return res.json();
}

export async function fetchArtworksServerSide(params = {}) {
  // undefined/null 파라미터 제거
  const filtered = Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== undefined && v !== null && v !== "",
    ),
  );
  const query = new URLSearchParams(
    filtered as Record<string, string>,
  ).toString();

  const res = await authenticatedFetch(`${API_BASE_URL}/artworks/?${query}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch artworks");
  return res.json();
}

export async function postPresignedUrl(fileName: string, fileType: string) {
  const res = await authenticatedFetch(`${API_BASE_URL}/presigned-url/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_name: fileName, file_type: fileType }),
  });
  if (!res.ok) throw new Error("Presigned URL 요청 실패");
  return res.json();
}

export async function getClients() {
  const res = await authenticatedFetch(`${API_BASE_URL}/clients/`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("고객 목록 조회 실패");
  return res.json();
}

export async function addClient(data: any) {
  console.log("🚀 addClient 함수 호출됨!");
  console.log("🔍 받은 데이터:", data);
  
  // name, phone, tags, gallery 분리하여 일관된 구조로 전송
  const { name, phone, tags, gallery, ...rest } = data;
  console.log("📋 데이터 분리 결과:", { name, phone, tags, gallery, rest });
  
  // 갤러리 정보 확인 및 사용자 정보에서 갤러리 추출
  let galleryId = gallery;
  if (!galleryId) {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        galleryId = user.gallery_id || user.gallery;
        console.log("📍 localStorage에서 갤러리 ID 추출:", galleryId);
      } catch (error) {
        console.error("❌ user_data 파싱 실패:", error);
      }
    }
  }
  
  const payload = {
    name: name || "",
    phone: phone || "",
    gallery: galleryId, // 갤러리 ID 추가
    tag_ids: tags
      ? tags.map((tag: any) => (typeof tag === "object" ? tag.id : tag))
      : [],
    data: rest,
  };
  
  console.log("📤 전송할 payload (갤러리 포함):", payload);
  console.log("🌐 요청 URL:", `${API_BASE_URL}/clients/`);

  const res = await authenticatedFetch(`${API_BASE_URL}/clients/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  console.log("📡 서버 응답 상태:", res.status, res.statusText);
  
  if (!res.ok) {
    const errorData = await res.text();
    console.error("❌ addClient 실패:", res.status, errorData);
    throw new Error("고객 추가 실패");
  }
  
  const result = await res.json();
  console.log("✅ addClient 성공:", result);
  return result;
}

export async function updateClient(id: number, data: any) {
  // 먼저 기존 클라이언트 데이터를 가져옴
  const existingClient = await fetchClientDetail(id);

  // name, phone, tags 분리하여 일관된 구조로 전송
  const { name, phone, tags, ...rest } = data;

  console.log('🔍 [updateClient] 입력 데이터 분석:', {
    name, phone, tags, 
    hasTagsField: 'tags' in data,
    tagsValue: tags,
    restKeys: Object.keys(rest)
  });

  // 기존 데이터와 새로운 데이터를 병합 (기존 데이터 보존)
  const payload = {
    name: name !== undefined ? name : existingClient.name || "",
    phone: phone !== undefined ? phone : existingClient.phone || "",
    data: { ...existingClient.data, ...rest }, // 기존 data와 새로운 data 병합
  };

  // tags가 명시적으로 전달된 경우에만 tag_ids 추가
  if ('tags' in data && tags !== undefined) {
    // 태그 ID 추출 (임시 ID -1 제외)
    const tagIds = tags
      ? tags
          .filter((tag: any) => tag.id !== -1) // 임시 기본 태그 제외
          .map((tag: any) => (typeof tag === "object" ? tag.id : tag))
      : [];
    payload.tag_ids = tagIds;
    console.log('🏷️ [updateClient] 태그 포함하여 전송:', tagIds);
  } else {
    console.log('🏷️ [updateClient] 태그 제외하여 전송 (기존 태그 보존)');
  }

  console.log("🔧 updateClient 요청:", {
    id,
    originalData: data,
    existingClient,
    payload,
  });

  const res = await authenticatedFetch(`${API_BASE_URL}/clients/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("🚨 updateClient 서버 응답:", res.status, errorText);
    throw new Error(`고객 수정 실패 (${res.status}): ${errorText}`);
  }

  const result = await res.json();
  console.log("✅ updateClient 성공:", result);
  return result;
}

export async function deleteClient(id: number) {
  const res = await authenticatedFetch(`${API_BASE_URL}/clients/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("고객 삭제 실패");
  return true;
}

export async function getClientColumns() {
  const res = await authenticatedFetch(`${API_BASE_URL}/client-columns/`);
  if (!res.ok) throw new Error("컬럼 구조 조회 실패");
  return res.json();
}

export async function createClientColumn(column: {
  header: string;
  accessor: string;
  type: string;
  order: number;
}) {
  const res = await authenticatedFetch(`${API_BASE_URL}/client-columns/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(column),
  });
  if (!res.ok) throw new Error("컬럼 생성 실패");
  return res.json();
}

export async function deleteClientColumn(id: number) {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/client-columns/${id}/`,
    {
      method: "DELETE",
    },
  );
  if (!res.ok) throw new Error("컬럼 삭제 실패");
  return true;
}

export async function updateClientColumn(
  id: number,
  data: { header?: string; accessor?: string; type?: string; order?: number },
) {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/client-columns/${id}/`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  if (!res.ok) throw new Error("컬럼 수정 실패");
  return res.json();
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getArtworks() {
  const res = await authenticatedFetch(`${API_BASE}/artworks/`);
  if (!res.ok) throw new Error("작품 데이터를 불러오지 못했습니다");
  return res.json();
}

// 태그 관리 API (새 ManyToMany 시스템)
export async function getAllTags() {
  const res = await authenticatedFetch(`${API_BASE_URL}/tags/`);
  if (!res.ok) throw new Error("태그 목록 조회 실패");
  return res.json();
}

export async function createTag(name: string, color?: string) {
  const url = `${API_BASE_URL}/tags/`;
  console.log("🏷️ createTag 호출:", { url, name, color });

  const res = await authenticatedFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.trim(),
      color: color || "#3B82F6",
    }),
  });

  console.log("🏷️ createTag 응답:", { status: res.status, url });

  if (!res.ok) {
    console.error("❌ createTag 실패:", res.status, await res.text());
    throw new Error("태그 생성 실패");
  }
  return res.json();
}

export async function updateTag(
  id: number,
  data: { name?: string; color?: string },
) {
  const res = await authenticatedFetch(`${API_BASE_URL}/tags/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("태그 수정 실패");
  return res.json();
}

export async function deleteTag(id: number) {
  const res = await authenticatedFetch(`${API_BASE_URL}/tags/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("태그 삭제 실패");
  return true;
}

export async function filterClientsByTag(tagIds: number[]) {
  const params = new URLSearchParams();
  tagIds.forEach((id) => params.append("tag_ids[]", id.toString()));

  const res = await authenticatedFetch(
    `${API_BASE_URL}/clients/filter-by-tag/?${params.toString()}`,
  );
  if (!res.ok) throw new Error("태그 필터링 실패");
  return res.json();
}

// 하위 호환성을 위한 래퍼 함수들 (기존 코드에서 사용 중인 경우)
export async function addClientTag(
  clientId: number,
  tag: string | { id: number; name: string },
) {
  // 새로운 방식: 클라이언트 데이터를 직접 업데이트
  const client = await fetchClientDetail(clientId);
  const currentTags = client.tags || [];

  let tagToAdd;
  if (typeof tag === "string") {
    // 문자열인 경우 태그 생성 또는 찾기
    tagToAdd = await createTag(tag);
  } else {
    tagToAdd = tag;
  }

  // 중복 체크
  if (currentTags.some((t: any) => t.id === tagToAdd.id)) {
    return { tags: currentTags }; // 이미 존재하는 경우
  }

  const updatedTags = [...currentTags, tagToAdd];
  await updateClient(clientId, { ...client, tags: updatedTags });

  return { tags: updatedTags };
}

export async function removeClientTag(
  clientId: number,
  tag: string | { id: number; name: string },
) {
  const client = await fetchClientDetail(clientId);
  const currentTags = client.tags || [];

  let tagIdToRemove;
  if (typeof tag === "string") {
    const tagToRemove = currentTags.find((t: any) => t.name === tag);
    if (!tagToRemove) return { tags: currentTags };
    tagIdToRemove = tagToRemove.id;
  } else {
    tagIdToRemove = tag.id;
  }

  const updatedTags = currentTags.filter((t: any) => t.id !== tagIdToRemove);
  await updateClient(clientId, { ...client, tags: updatedTags });

  return { tags: updatedTags };
}

// 새로운 엑셀 처리 API
export async function analyzeExcelHeaders(headers: string[]) {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/excel/analyze-headers/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headers }),
    },
  );
  if (!res.ok) throw new Error("헤더 분석 실패");
  return res.json();
}

export async function processExcelData(excelData: any[]) {
  const res = await authenticatedFetch(`${API_BASE_URL}/excel/process-data/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: excelData }),
  });
  if (!res.ok) throw new Error("엑셀 데이터 처리 실패");
  return res.json();
}

// 새로운 pandas 기반 엑셀 업로드 API
export async function uploadExcelFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await authenticatedFetch(`${API_BASE_URL}/excel/upload/`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "엑셀 파일 업로드 실패");
  }

  return res.json();
}

// 태그만 업데이트하는 전용 API
export async function updateClientTagsOnly(clientId: number, tags: any[]) {
  const tagIds = tags
    .filter((tag: any) => tag.id !== -1) // 임시 기본 태그 제외
    .map((tag: any) => (typeof tag === "object" ? tag.id : tag));

  const res = await authenticatedFetch(
    `${API_BASE_URL}/clients/${clientId}/tags/`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_ids: tagIds }),
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`태그 업데이트 실패 (${res.status}): ${errorText}`);
  }

  return res.json();
}

// 프론트엔드 로그를 백엔드 터미널에 출력
export async function logToTerminal(message: string, data?: any, level: string = 'INFO') {
  try {
    await authenticatedFetch(`${API_BASE_URL}/debug/log/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, data, level })
    });
  } catch (error) {
    console.error('터미널 로그 전송 실패:', error);
  }
}
