import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('Email confirmation error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=confirmation_failed`)
    }
  }

  // Başarılı doğrulama sonrası login sayfasına yönlendir
  return NextResponse.redirect(`${requestUrl.origin}/login?confirmed=true`)
}