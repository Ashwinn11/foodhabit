-- Fix the delete_user_account function to work without session_replication_role
-- Drop the existing function
DROP FUNCTION IF EXISTS delete_user_account(UUID);

-- Create the corrected function
CREATE OR REPLACE FUNCTION delete_user_account(user_id_to_delete UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges to bypass RLS
SET search_path = public
AS $$
DECLARE
    total_deleted INTEGER := 0;
    current_deleted INTEGER;
    result JSONB;
BEGIN
    -- Verify the caller is deleting their own account (security check)
    IF user_id_to_delete != auth.uid() THEN
        RAISE EXCEPTION 'You can only delete your own account';
    END IF;

    -- Delete in order of dependency (child tables first)
    -- SECURITY DEFINER allows us to delete without RLS restrictions
    
    DELETE FROM score_components WHERE user_id = user_id_to_delete;
    GET DIAGNOSTICS current_deleted = ROW_COUNT;
    total_deleted := total_deleted + current_deleted;

    DELETE FROM weekly_challenges WHERE user_id = user_id_to_delete;
    GET DIAGNOSTICS current_deleted = ROW_COUNT;
    total_deleted := total_deleted + current_deleted;

    DELETE FROM mood_entries WHERE user_id = user_id_to_delete;
    GET DIAGNOSTICS current_deleted = ROW_COUNT;
    total_deleted := total_deleted + current_deleted;

    DELETE FROM food_triggers WHERE user_id = user_id_to_delete;
    GET DIAGNOSTICS current_deleted = ROW_COUNT;
    total_deleted := total_deleted + current_deleted;

    DELETE FROM achievements WHERE user_id = user_id_to_delete;
    GET DIAGNOSTICS current_deleted = ROW_COUNT;
    total_deleted := total_deleted + current_deleted;

    DELETE FROM user_scores WHERE user_id = user_id_to_delete;
    GET DIAGNOSTICS current_deleted = ROW_COUNT;
    total_deleted := total_deleted + current_deleted;

    DELETE FROM user_streaks WHERE user_id = user_id_to_delete;
    GET DIAGNOSTICS current_deleted = ROW_COUNT;
    total_deleted := total_deleted + current_deleted;

    DELETE FROM energy_entries WHERE user_id = user_id_to_delete;
    GET DIAGNOSTICS current_deleted = ROW_COUNT;
    total_deleted := total_deleted + current_deleted;

    DELETE FROM meal_entries WHERE user_id = user_id_to_delete;
    GET DIAGNOSTICS current_deleted = ROW_COUNT;
    total_deleted := total_deleted + current_deleted;

    DELETE FROM stool_entries WHERE user_id = user_id_to_delete;
    GET DIAGNOSTICS current_deleted = ROW_COUNT;
    total_deleted := total_deleted + current_deleted;

    DELETE FROM users WHERE id = user_id_to_delete;
    GET DIAGNOSTICS current_deleted = ROW_COUNT;
    total_deleted := total_deleted + current_deleted;

    -- Build result
    result := jsonb_build_object(
        'success', true,
        'deleted_records', total_deleted,
        'user_id', user_id_to_delete
    );

    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        result := jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'user_id', user_id_to_delete
        );
        RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_user_account IS 'Securely deletes all user data. Uses SECURITY DEFINER to bypass RLS. Can only be called by the user themselves.';
