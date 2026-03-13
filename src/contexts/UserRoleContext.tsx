import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@clerk/clerk-react";
import { getUserProfile } from "@/lib/api";
import type { UserProfileDTO } from "@/types";

interface UserRoleContextType {
  /** Full profile from our DB. null while loading or signed out. */
  profile: UserProfileDTO | null;
  /** True while Clerk is initialising OR while the /me fetch is in flight. */
  loading: boolean;
  /** Re-fetch /me from the backend after profile changes. */
  refreshProfile: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType>({
  profile: null,
  loading: true,
  refreshProfile: async () => { },
});

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  // isLoaded: Clerk SDK has finished initialising (crucial — without it isSignedIn is undefined)
  // isSignedIn: whether there is an active Clerk session
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  // Keep loading=true until we know whether the user is signed in or not.
  const [loading, setLoading] = useState(true);

  /**
   * Fetch /api/v1/users/me and store the result.
   * getToken() always returns the live session token so it's safe to call
   * without re-creating this callback every time isSignedIn changes.
   */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        // Signed in but token unavailable yet — treat as loading
        setProfile(null);
        return;
      }
      const data = await getUserProfile(token);
      setProfile(data);
    } catch (err) {
      console.error("[UserRoleContext] GET /me failed:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [getToken]); // getToken is a stable Clerk reference

  useEffect(() => {
    // Wait until the Clerk SDK has fully loaded before doing anything.
    if (!isLoaded) return;

    if (isSignedIn) {
      // User is authenticated → fetch their profile from our backend.
      fetchProfile();
    } else {
      // Definitively not signed in → clear state immediately.
      setProfile(null);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, fetchProfile]);

  return (
    <UserRoleContext.Provider
      value={{ profile, loading, refreshProfile: fetchProfile }}
    >
      {children}
    </UserRoleContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUserRole = () => useContext(UserRoleContext);
