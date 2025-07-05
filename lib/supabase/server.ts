import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL="https://prcomnldozwjodkuokaj.supabase.co", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY29tbmxkb3p3am9ka3Vva2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjI3NTYsImV4cCI6MjA2NzI5ODc1Nn0._19Qy9kAApEVG3D4Efd6DF9gjHlbP_8caL3DLguSkNE", {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The setAll method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
