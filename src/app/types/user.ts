export interface User {
    id: number;
    auth_user_id: string;
    name?: string;
    last_name?: string;
    display_name?: string;
    img_url?: string;
    description?: string;
    first_time?: boolean;
    default_currency?: number;
    default_city?: string;
    default_country?: string;
    language?: string;
    theme_preference?: string;
    created_at?: number;
}
