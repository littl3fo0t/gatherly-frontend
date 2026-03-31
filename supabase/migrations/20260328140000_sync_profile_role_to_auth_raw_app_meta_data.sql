-- JWT `app_metadata` is derived from auth.users.raw_app_meta_data (plus provider fields).
-- Sync profiles.role there so the app role appears without relying on the Custom Access Token hook
-- being enabled in the dashboard.

CREATE OR REPLACE FUNCTION public.sync_profile_role_to_auth_app_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(NEW.role::text),
    true
  )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_sync_profile_role_to_auth ON public.profiles;

CREATE TRIGGER trigger_sync_profile_role_to_auth
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role_to_auth_app_metadata();

UPDATE auth.users u
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  to_jsonb(p.role::text),
  true
)
FROM public.profiles p
WHERE p.id = u.id;
