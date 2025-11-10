-- Create enum for user roles
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  created_at timestamptz default now() not null,
  unique (user_id, role)
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- RLS Policies for user_roles
create policy "User roles are viewable by everyone"
  on public.user_roles
  for select
  using (true);

create policy "Only admins can insert user roles"
  on public.user_roles
  for insert
  with check (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Only admins can update user roles"
  on public.user_roles
  for update
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Only admins can delete user roles"
  on public.user_roles
  for delete
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Function to assign default user role on signup
create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  return new;
end;
$$;

-- Trigger to assign default role
create trigger on_auth_user_created_role
  after insert on auth.users
  for each row
  execute function public.handle_new_user_role();

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies for avatars
create policy "Avatar images are publicly accessible"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects
  for insert
  with check (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects
  for update
  using (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects
  for delete
  using (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );