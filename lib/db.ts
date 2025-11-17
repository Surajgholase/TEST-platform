import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

// Database helper functions
export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
}

export async function getCompanies() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return { data, error };
}

export async function getQuestions(filters: {
  difficulty?: string;
  company_id?: string | null;
  category?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("questions")
    .select("*")
    .eq("is_active", true);

  if (filters.difficulty) {
    query = query.eq("difficulty_level", filters.difficulty);
  }
  if (filters.company_id) {
    query = query.eq("company_id", filters.company_id);
  } else {
    query = query.is("company_id", null);
  }
  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  return { data, error };
}

export function useSupabaseBrowser() {
  return createBrowserClient();
}
