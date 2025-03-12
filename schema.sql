-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'explorer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  business_name VARCHAR(255),
  business_type VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create admin user (password: admin123)
INSERT INTO users (email, name, password, status, created_at, updated_at)
VALUES (
  'admin@downstreamwealth.com',
  'Admin User',
  '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', -- bcrypt hash for 'admin123'
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
