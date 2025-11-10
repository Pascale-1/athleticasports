-- Create profiles table
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  username text not null unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
create policy "Profiles are viewable by everyone"
  on public.profiles
  for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

-- Function to generate random username
create or replace function public.generate_random_username()
returns text
language plpgsql
as $$
declare
  adjectives text[] := array['Swift', 'Bold', 'Brave', 'Quick', 'Mighty', 'Fierce', 'Smart', 'Cool', 'Wild', 'Noble'];
  nouns text[] := array['Tiger', 'Eagle', 'Lion', 'Wolf', 'Falcon', 'Hawk', 'Bear', 'Fox', 'Panther', 'Shark'];
  random_username text;
  username_exists boolean;
begin
  loop
    random_username := adjectives[floor(random() * array_length(adjectives, 1) + 1)] || 
                       nouns[floor(random() * array_length(nouns, 1) + 1)] || 
                       floor(random() * 9999 + 1)::text;
    
    select exists(select 1 from public.profiles where username = random_username) into username_exists;
    
    exit when not username_exists;
  end loop;
  
  return random_username;
end;
$$;

-- Function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, username, display_name)
  values (
    new.id,
    generate_random_username(),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  return new;
end;
$$;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();