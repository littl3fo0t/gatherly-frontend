-- App role from profiles.role → JWT app_metadata.role (Custom Access Token Hook).
-- user_metadata is reconciled from auth.users; app_metadata is for server-controlled claims.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  claims jsonb;
  user_role text;
  uid uuid;
BEGIN
  uid := (event->>'user_id')::uuid;
  claims := coalesce(event->'claims', '{}'::jsonb);

  SELECT p.role::text
  INTO user_role
  FROM public.profiles p
  WHERE p.id = uid;

  IF user_role IS NULL THEN
    user_role := 'user';
  END IF;

  claims := jsonb_set(
    claims,
    '{app_metadata}',
    coalesce(claims->'app_metadata', '{}'::jsonb)
      || jsonb_build_object('role', to_jsonb(user_role))
  );

  RETURN jsonb_set(event, '{claims}', claims);
END;
$function$;
