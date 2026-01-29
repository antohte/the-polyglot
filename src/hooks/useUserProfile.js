// src/hooks/useUserProfile.js
import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function useUserProfile(uid) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(!!uid);

  useEffect(() => {
    let mounted = true;
    if (!uid) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const data = await api.users.get(uid);
        if (mounted) {
          setProfile({
            ...data,
            // Map snake_case to camelCase
            fullName: data.full_name,
            firstName: (data.full_name || "").split(" ")[0] || "",
            lastName: (data.full_name || "").split(" ").slice(1).join(" ") || "",
            displayName: data.display_name,
            photoUrl: data.photo_url,
            licenseYear: data.license_year,
            // social_links is already object if JSON column
            socialLinks: typeof data.social_links === 'string' ? JSON.parse(data.social_links) : (data.social_links || {})
          });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        // If 404, profile is null
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProfile();
    return () => { mounted = false; };
  }, [uid]);

  return { profile, loading };
}
