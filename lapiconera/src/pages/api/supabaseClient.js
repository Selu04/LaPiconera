import { createClient } from '@supabase/supabase-js'
const supabaseUrl = "https://oeakibkrouxtehvwjmlz.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lYWtpYmtyb3V4dGVodndqbWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDMyNzgsImV4cCI6MjA2MDg3OTI3OH0.79GpR-smy5Jtj25VkJcaQHXziAFMRwZbHjvFls44l-M"
export const supabase = createClient(supabaseUrl, supabaseKey)

