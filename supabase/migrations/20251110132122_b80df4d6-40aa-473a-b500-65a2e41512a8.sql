-- Fix search_path for generate_random_username function
create or replace function public.generate_random_username()
returns text
language plpgsql
security definer
set search_path = public
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

-- Fix search_path for handle_updated_at function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;