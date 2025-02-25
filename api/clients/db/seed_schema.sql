-- schema.sql
-- PostgreSQL schema for Users and OAuth Credentials tables

-- Create the "users" table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email CHARACTER VARYING NOT NULL UNIQUE,
    first_name CHARACTER VARYING,
    last_name CHARACTER VARYING,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE oauth_provider AS ENUM ('gcal', 'notion');

CREATE TABLE oauth_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider oauth_provider,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,         -- when the access token expires
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, provider)
);