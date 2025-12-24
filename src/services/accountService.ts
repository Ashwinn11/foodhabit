import { supabase } from '../config/supabase';

export interface DeleteAccountResult {
  success: boolean;
  deletedRecords?: number;
  error?: string;
}

/**
 * Delete user account and all associated data
 * This will:
 * 1. Delete all user data from all tables
 * 2. Delete the user from Supabase Auth via Edge Function
 * 3. Sign out the user
 */
export const deleteAccount = async (): Promise<DeleteAccountResult> => {
  try {
    // Refresh the session to ensure we have a valid token
    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();

    if (sessionError || !session) {
      return {
        success: false,
        error: 'No authenticated user found or session expired'
      };
    }

    // Call the Edge Function for complete account deletion
    // The Supabase client automatically handles authentication headers
    const { data, error } = await supabase.functions.invoke('delete-account', {
      body: { confirmed: true }
    });

    if (error) {
      console.error('Error calling delete-account function:', error);
      return {
        success: false,
        error: error.message
      };
    }

    if (!data?.success) {
      console.error('Delete function failed:', data);
      return {
        success: false,
        error: data?.error || 'Failed to delete account'
      };
    }

    // Sign out the user (they'll already be signed out from auth deletion)
    await supabase.auth.signOut();

    return {
      success: true,
      deletedRecords: data.deletedRecords
    };

  } catch (error) {
    console.error('Unexpected error during account deletion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

/**
 * Request account deletion (requires confirmation)
 * This will initiate the deletion process after user confirmation
 */
export const requestAccountDeletion = async (
  confirmed: boolean
): Promise<DeleteAccountResult> => {
  if (!confirmed) {
    return {
      success: false,
      error: 'Account deletion must be confirmed'
    };
  }

  return await deleteAccount();
};