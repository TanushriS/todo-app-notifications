import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!client) {
    client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL="https://prcomnldozwjodkuokaj.supabase.co", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY29tbmxkb3p3am9ka3Vva2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjI3NTYsImV4cCI6MjA2NzI5ODc1Nn0._19Qy9kAApEVG3D4Efd6DF9gjHlbP_8caL3DLguSkNE")
  }
  return client
}
