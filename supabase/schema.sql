-- ============================================================
-- Bumipedia schema — jalanin sekali di Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste semua → Run)
-- ============================================================

-- Data perumahan hasil crawl Sikumbang (listLokasi per halaman)
create table if not exists public.properties (
  id text primary key,                      -- idLokasi, mis. "TSM0610072024T002"
  name text not null,
  developer_name text,
  property_type text not null default 'subsidi', -- 'subsidi' | 'komersil'
  price bigint,
  min_dp bigint,
  currency text not null default 'IDR',
  address text,
  province text,
  kabupaten text,
  kecamatan text,
  kelurahan text,
  kode_wilayah text,
  lat double precision,
  lng double precision,
  images jsonb not null default '[]'::jsonb,
  whatsapp_number text,
  specs jsonb,                               -- hasil enrichment (lb/lt/kamar/listrik/air)
  raw jsonb,                                 -- data mentah listLokasi (buat audit/re-parse)
  enriched boolean not null default false,   -- true kalau udah diambil detail (harga/tipe)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_properties_kabupaten on public.properties (kabupaten);
create index if not exists idx_properties_kecamatan on public.properties (kecamatan);

-- State crawler (progres halaman)
create table if not exists public.crawl_state (
  id int primary key default 1,
  last_page int not null default 0,
  pages_total int not null default 1157,
  updated_at timestamptz not null default now(),
  constraint solo_row check (id = 1)
);

insert into public.crawl_state (id) values (1) on conflict do nothing;

-- Service role key bypass RLS, jadi gak perlu policy tambahan.
-- Pastikan table gak kebaca anon: (default RLS off = anon bisa SELECT via API.
-- Kalau mau aman, aktifkan RLS tanpa policy — service role tetap bisa akses):
alter table public.properties enable row level security;
alter table public.crawl_state enable row level security;
