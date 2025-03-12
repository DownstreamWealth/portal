import { sql } from '@vercel/postgres';
import { hash, compare } from 'bcrypt';

// User types
export type User = {
  id: number;
  email: string;
  name: string | null;
  password: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Profile = {
  id: number;
  userId: number;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  businessName: string | null;
  businessType: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Helper functions
export async function getUserByEmail(email: string): Promise<User[]> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return result.rows as User[];
  } catch (error) {
    console.error('Error getting user by email:', error);
    return [];
  }
}

export async function getUserById(id: number): Promise<User[]> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `;
    return result.rows as User[];
  } catch (error) {
    console.error('Error getting user by id:', error);
    return [];
  }
}

export async function getUserProfile(userId: number): Promise<Profile[]> {
  try {
    const result = await sql`
      SELECT * FROM profiles WHERE user_id = ${userId} LIMIT 1
    `;
    return result.rows as Profile[];
  } catch (error) {
    console.error('Error getting user profile:', error);
    return [];
  }
}

export async function updateUserStatus(userId: number, status: string): Promise<void> {
  try {
    await sql`
      UPDATE users 
      SET status = ${status}, updated_at = NOW() 
      WHERE id = ${userId}
    `;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

export async function createUser(name: string, email: string, password: string): Promise<void> {
  try {
    const hashedPassword = await hash(password, 10);
    
    await sql`
      INSERT INTO users (name, email, password, status, created_at, updated_at)
      VALUES (${name}, ${email}, ${hashedPassword}, 'explorer', NOW(), NOW())
    `;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return compare(plainPassword, hashedPassword);
}

export async function updateProfile(
  userId: number, 
  data: Partial<Profile>, 
  type: 'personal' | 'business'
): Promise<void> {
  try {
    // Check if profile exists
    const profiles = await getUserProfile(userId);
    
    if (profiles.length === 0) {
      // Create new profile
      if (type === 'personal') {
        await sql`
          INSERT INTO profiles (
            user_id, phone, address, city, state, zip_code, created_at, updated_at
          ) VALUES (
            ${userId}, ${data.phone || null}, ${data.address || null}, 
            ${data.city || null}, ${data.state || null}, ${data.zipCode || null}, 
            NOW(), NOW()
          )
        `;
      } else {
        await sql`
          INSERT INTO profiles (
            user_id, business_name, business_type, created_at, updated_at
          ) VALUES (
            ${userId}, ${data.businessName || null}, ${data.businessType || null}, 
            NOW(), NOW()
          )
        `;
      }
    } else {
      // Update existing profile
      if (type === 'personal') {
        await sql`
          UPDATE profiles SET
            phone = ${data.phone || null},
            address = ${data.address || null},
            city = ${data.city || null},
            state = ${data.state || null},
            zip_code = ${data.zipCode || null},
            updated_at = NOW()
          WHERE user_id = ${userId}
        `;
      } else {
        await sql`
          UPDATE profiles SET
            business_name = ${data.businessName || null},
            business_type = ${data.businessType || null},
            updated_at = NOW()
          WHERE user_id = ${userId}
        `;
      }
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}
