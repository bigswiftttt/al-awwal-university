import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return profile
}

export async function requireRole(role: 'admin' | 'student' | 'lecturer') {
    const profile = await getCurrentUser()
    if (!profile) redirect('/login')
    if (profile.role !== role) redirect('/')
    return profile
}