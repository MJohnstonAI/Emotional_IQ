-- Add is_admin flag to user profiles and enforce via trigger
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION set_profile_admin_flag()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = NEW.user_id
      AND email = 'syncteamai@gmail.com'
  ) THEN
    NEW.is_admin := TRUE;
  ELSE
    NEW.is_admin := FALSE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_set_admin ON user_profiles;
CREATE TRIGGER user_profiles_set_admin
BEFORE INSERT OR UPDATE
ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION set_profile_admin_flag();
