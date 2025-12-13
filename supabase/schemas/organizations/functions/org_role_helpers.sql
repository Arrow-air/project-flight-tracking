-- Don't allow an organization to lose its last owner
-- Org must be deleted, owner member will cascade delete
CREATE OR REPLACE FUNCTION prevent_losing_last_org_owner()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  remaining_owners integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Deleting a row
    IF OLD.role = 'owner' THEN
      SELECT count(*) INTO remaining_owners
      FROM organization_members
      WHERE organization_id = OLD.organization_id
        AND role = 'owner'
        AND user_id <> OLD.user_id;

      IF remaining_owners = 0 THEN
        RAISE EXCEPTION
          'Organization % must have at least one owner',
          OLD.organization_id;
      END IF;
    END IF;

    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Updating a row: check if we are demoting an owner
    IF OLD.role = 'owner' AND NEW.role <> 'owner' THEN
      SELECT count(*) INTO remaining_owners
      FROM organization_members
      WHERE organization_id = OLD.organization_id
        AND role = 'owner'
        AND user_id <> OLD.user_id;

      IF remaining_owners = 0 THEN
        RAISE EXCEPTION
          'Organization % must have at least one owner',
          NEW.organization_id;
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL; -- should never reach here
END;
$$;

CREATE TRIGGER handle_prevent_losing_last_org_owner
    BEFORE UPDATE OR DELETE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_losing_last_org_owner();

