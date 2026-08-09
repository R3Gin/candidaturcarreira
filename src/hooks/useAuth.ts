import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AccountType = "candidato" | "empresa" | "freela";

export type Profile = {
  id: string;
  account_type: AccountType;
  name: string;
  email: string;
  phone: string;
  photo_url: string | null;
  occupation: string | null;
  username: string | null;
  terms_accepted_at: string | null;
  onboarded_at: string | null;
};

/** Sessão + perfil da pessoa logada. Executa somente no cliente. */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (id: string) => {
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, account_type, name, email, phone, photo_url, occupation, username, terms_accepted_at, onboarded_at",
      )
      .eq("id", id)
      .maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      setUser(next?.user ?? null);
      if (!next?.user) setProfile(null);
      else void loadProfile(next.user.id);
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) await loadProfile(data.session.user.id);
      setLoading(false);
    })();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { session, user, profile, loading, refreshProfile, signOut };
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  name: string;
  accountType: AccountType;
}) {
  const redirect = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      ...(redirect ? { emailRedirectTo: redirect } : {}),
      data: { name: input.name, account_type: input.accountType },
    },
  });
  if (error) throw error;
}

export async function signInWithGoogle(accountType: AccountType) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("candidatu-account-type", accountType);
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw error;
}

/** Rota inicial de cada tipo de conta. */
export function homeForAccount(type: AccountType | undefined) {
  if (type === "empresa") return "/empresa";
  if (type === "freela") return "/freelance";
  return "/painel";
}
