export type UserRole = 'admin' | 'student' | 'lecturer'

export interface Profile {
    id: string
    email: string
    full_name: string
    role: UserRole
    created_at: string
}