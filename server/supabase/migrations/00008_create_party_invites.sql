create table public.party_invites (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id) on delete cascade,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  invited_user uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(party_id, invited_user)
);

create index idx_party_invites_invited_user on public.party_invites(invited_user);
create index idx_party_invites_party on public.party_invites(party_id);

-- RLS policies
alter table public.party_invites enable row level security;

create policy "Users can view own invites"
  on public.party_invites for select
  using (auth.uid() = invited_by or auth.uid() = invited_user);

create policy "Users can send invites"
  on public.party_invites for insert
  with check (auth.uid() = invited_by);

create policy "Invited user can respond"
  on public.party_invites for update
  using (auth.uid() = invited_user);

create policy "Users can delete own invites"
  on public.party_invites for delete
  using (auth.uid() = invited_by or auth.uid() = invited_user);

-- Enable realtime for invite notifications
alter publication supabase_realtime add table public.party_invites;
