create table public.parties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz default now() not null,
  ended_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

create table public.party_members (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score numeric default 0,
  joined_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz,
  unique(party_id, user_id)
);

create index idx_parties_created_by on public.parties(created_by);
create index idx_party_members_party on public.party_members(party_id);
create index idx_party_members_user on public.party_members(user_id);
