export type PropertyType = 'subsidi' | 'komersil';

export interface SecuritySpecs {
  satpam_24jam?: boolean;
  one_gate_system?: boolean;
  cctv_lingkungan?: boolean;
}

export interface NearbyAccessSpecs {
  pusat_belanja?: string[];
  rumah_sakit?: string[];
  sekolah?: string[];
  akses_tol?: string[];
}

export interface PropertySpecifications {
  lb: number; // Luas Bangunan (m²)
  lt: number; // Luas Tanah (m²)
  kamar_tidur: number;
  kamar_mandi: number;
  listrik: string;
  air: string;
  tahun_dibangun?: number;
  keamanan?: SecuritySpecs;
  akses_terdekat?: NearbyAccessSpecs;
}

export interface Property {
  id: string;
  region_id: string;
  name: string;
  developer_name: string;
  property_type: PropertyType;
  price: number; // In IDR or base currency
  min_dp: number;
  max_cash_installment_months: number;
  currency: string;
  address: string;
  lat: number;
  lng: number;
  images: string[];
  is_brochure_fallback?: boolean;
  legalities: string[]; // ["SHM", "PBG/IMB", "PBB Pecah"]
  specifications: PropertySpecifications;
  whatsapp_number: string; // Formatted E.164 e.g. "6281234567890"
  instagram_url?: string;
  tiktok_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Region {
  id: string;
  parent_id: string | null;
  name: string;
  type: 'PROVINSI' | 'KOTA' | 'KABUPATEN' | 'KECAMATAN';
  country_code: string;
  lat?: number;
  lng?: number;
  zoom?: number;
}

export interface Appointment {
  id?: string;
  property_id: string;
  user_name: string;
  user_phone: string;
  survey_type: 'LOKASI_LANGSUNG' | 'LIVE_ONLINE';
  scheduled_date: string;
  status?: string;
}

export type SupportedLanguage =
  | 'id'   // Bahasa Indonesia
  | 'en'   // English
  | 'zh'   // Chinese (Mandarin)
  | 'ms'   // Bahasa Melayu (Malaysia)
  | 'fr'   // French
  | 'th'   // Thai
  | 'ph'   // Tagalog (Philippines)
  | 'ja'   // Japanese
  | 'ko'   // Korean
  | 'ru'   // Russian
  | 'su'   // Bahasa Sunda
  | 'jv'   // Bahasa Jawa
  | 'min'  // Bahasa Minang
  | 'btk'  // Bahasa Batak
  | 'pap'; // Bahasa Papua / Indonesia Timur
