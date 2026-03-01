
CREATE OR REPLACE FUNCTION public.generate_random_username()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  random_username text;
  username_exists boolean;
begin
  loop
    random_username := 'user_' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 8);
    select exists(select 1 from public.profiles where username = random_username) into username_exists;
    exit when not username_exists;
  end loop;
  return random_username;
end;
$function$;
