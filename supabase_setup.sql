-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Users)
-- Links to Supabase Auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CLIENTS (Shared Database of Citizens/Clients)
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  document_id text, -- DNI/NIE
  name text not null,
  email text,
  phone text,
  address text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PARTES (Main Reports)
create table public.partes (
  id bigserial primary key, -- Auto-incrementing ID for easy ref (or use UUID)
  type text not null, -- 'SIMPLE', 'CONJUNTO'
  status text not null, -- 'ABIERTO', 'CERRADO', etc.
  priority text, -- 'ALTA', 'MEDIA', 'BAJA'
  
  start_date timestamp with time zone not null,
  end_date timestamp with time zone, -- Can be null
  
  location text,
  description text,
  observation text,
  
  user_id uuid references public.profiles(id), -- Owner
  client_id uuid references public.clients(id), -- Linked Client (Optional)
  
  -- Metrics
  total_time integer default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone
);

-- 4. ACTUACIONES (Actions within a Parte)
create table public.actuaciones (
  id uuid default uuid_generate_v4() primary key,
  parte_id bigint references public.partes(id) on delete cascade not null,
  type text not null, -- 'Llamada', 'Correo', etc.
  description text,
  date timestamp with time zone not null,
  duration integer default 0, -- Minutes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SECURITY POLICIES (Row Level Security)
-- For now, we allow authenticated users to view/edit everything (Corporate Intranet Mode)

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.partes enable row level security;
alter table public.actuaciones enable row level security;

-- Policy: Allow read/write for authenticated users
create policy "Enable all for authenticated users" on public.profiles for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on public.clients for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on public.partes for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users" on public.actuaciones for all using (auth.role() = 'authenticated');

-- Handle New User Sign Up (Trigger to create Profile)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
