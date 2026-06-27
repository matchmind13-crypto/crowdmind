import { createClient } from '@supabase/supabase-js'

let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      'https://nlysintxbdetoybbbnb.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seXNpbnR4YmRldG95YmJibm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NzgzOTMsImV4cCI6MjA5NzQ1NDM5M30._j1KYimL8vX4P5ydtbu4PrsnREdWwPrpiKt6A1bv4xc'
    )
  }
  return supabaseInstance
})()