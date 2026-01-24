import { supabase } from "@/utils/supabase";

export const Auth = {
  handleLogout: async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  },
};
