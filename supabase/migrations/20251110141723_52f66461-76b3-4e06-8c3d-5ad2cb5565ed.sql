-- Update the generate_random_username function with bilingual sports theme
CREATE OR REPLACE FUNCTION public.generate_random_username()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  adjectives text[] := array[
    'Swift', 'Elite', 'Pro', 'Clutch', 'Prime', 
    'Rapide', 'Fort', 'Agile', 'Vif', 'Fou',
    'Legendary', 'Sonic', 'Turbo', 'Golden', 'Ultimate',
    'Super', 'Mega', 'Champion', 'Ultime', 'Flash'
  ];
  nouns text[] := array[
    'Striker', 'Keeper', 'Champion', 'Star', 'Ace',
    'Gardien', 'Attaquant', 'Joueur', 'Athlète', 'Éclair',
    'Legend', 'Hero', 'Thunder', 'Rocket', 'Titan',
    'Défenseur', 'Ailier', 'Phénix', 'Lion', 'Faucon'
  ];
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
$function$;