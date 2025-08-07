export type DynamicClient = Record<string, string | number | boolean | null | undefined | any[]>;

export interface ClientColumn {
    id: string; // 필드명
    header: string; // 컬럼명
    meta?: {
        type?: 'text' | 'number' | 'date' | 'checkbox' | 'select';
        options?: string[];
        required?: boolean;
    };
}
