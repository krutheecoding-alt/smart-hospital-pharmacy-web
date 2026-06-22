export interface ApiResult {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface User {
  user_id: string;
  username: string;
  fullname: string;
  role: string;
  department?: string;
  email?: string;
  must_change_password?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  page: string;
  tab?: string;
  group?: string;
  tone?: string;
}

export interface Branding {
  hospital_name: string;
  theme_primary: string;
  theme_secondary: string;
  theme_accent: string;
  logo_url?: string;
  has_logo?: boolean;
}