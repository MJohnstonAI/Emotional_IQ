import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const envAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const envKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;
export const supabaseAnonKey = envAnon ?? envKey ?? "";
export const supabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseEnabled
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
