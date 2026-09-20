import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('DEBUG getCurrentUser - user:', user?.id, 'email:', user?.email, 'error:', userError)
    if (!user) return null

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    console.log('DEBUG getCurrentUser - profile:', profile, 'profileError:', profileError)
    return profile
}

export async function requireRole(role: 'admin' | 'student' | 'lecturer') {
    const profile = await getCurrentUser()
    if (!profile) redirect('/login')
    if (profile.role !== role) redirect('/')
    return profile
}