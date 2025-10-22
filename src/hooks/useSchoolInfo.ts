// src/hooks/useSchoolInfo.ts
"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';

interface SchoolInfo {
  id: string;
  name: string;
  logo_url?: string;
}

export function useSchoolInfo() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const supabase = createClient();
        
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          setError('Unauthorized');
          return;
        }

        // Get user profile to get school_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profile || !profile.school_id) {
          setError('School not found');
          return;
        }

        // Get school information
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .select('id, name, logo_url')
          .eq('id', profile.school_id)
          .single();

        if (schoolError || !school) {
          setError('School information not found');
          return;
        }

        // Get the logo URL from storage if logo_url exists
        let logoUrl = school.logo_url;
        if (school.logo_url) {
          const { data: logoData } = supabase.storage
            .from('school-logos')
            .getPublicUrl(school.logo_url);
          logoUrl = logoData.publicUrl;
        }

        setSchoolInfo({
          ...school,
          logo_url: logoUrl
        });
      } catch (err) {
        console.error('Error fetching school info:', err);
        setError('Failed to load school information');
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolInfo();
  }, []);

  return {
    schoolInfo,
    loading,
    error,
  };
}
