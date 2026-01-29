import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProfessionalProfile {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  is_professional: boolean | null;
}

export function useProfessionalProfile() {
  return useQuery({
    queryKey: ["professional-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email, is_professional")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ProfessionalProfile | null;
    },
  });
}
