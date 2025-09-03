import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DbUser {
    id: string // Spotify user ID as primary key
    username: string // Display name from Spotify
    country: string
    artists: string[]
    songs: string[]
    genres: string[]
    created_at?: string
    updated_at?: string
    image?: string
}

// Function to upsert user data
export async function upsertUser(userData: DbUser) {
    try {
        const { data, error } = await supabase
            .from('users')
            .upsert(userData, {
                onConflict: 'id',
                ignoreDuplicates: false
            })
            .select()

        if (error) {
            console.error('Error upserting user:', error)

            // Check if it's a table doesn't exist error
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                throw new Error('Database table not found. Please run the SQL schema in your Supabase dashboard first.')
            }

            throw new Error(`Failed to save user data: ${error.message}`)
        }

        return data?.[0]
    } catch (err) {
        // Re-throw our custom errors
        if (err instanceof Error) {
            throw err
        }
        // Handle other types of errors (like network errors)
        throw new Error(`Database connection failed: ${err}`)
    }
}// Function to get all users except the current one
export async function getAllUsersExcept(excludeUserId: string) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .neq('id', excludeUserId)

        if (error) {
            console.error('Error fetching users:', error)

            // Check if it's a table doesn't exist error
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                throw new Error('Database table not found. Please run the SQL schema in your Supabase dashboard first.')
            }

            throw new Error(`Failed to fetch users: ${error.message}`)
        }

        return data || []
    } catch (err) {
        // Re-throw our custom errors
        if (err instanceof Error) {
            throw err
        }
        // Handle other types of errors (like network errors)
        throw new Error(`Database connection failed: ${err}`)
    }
}

// Function to get user by ID
export async function getUserById(userId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user:', error)
        throw new Error(`Failed to fetch user: ${error.message}`)
    }

    return data
}