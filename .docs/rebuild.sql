-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- Profiles table for user-specific public data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- Indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- Events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    event_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    image_url TEXT,
    category TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Users can view published events" ON public.events
FOR SELECT USING (is_published = true OR (select auth.uid()) = user_id);

CREATE POLICY "Users can manage own events" ON public.events
FOR ALL USING ((select auth.uid()) = user_id);

-- Indexes for performance
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_slug ON public.events(slug);

-- Lost and Found table
CREATE TABLE public.lost_and_found (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    date_lost_found DATE NOT NULL,
    location_lost_found TEXT,
    contact_info TEXT NOT NULL,
    image_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on lost_and_found table
ALTER TABLE public.lost_and_found ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lost_and_found
CREATE POLICY "Users can view published lost and found items" ON public.lost_and_found
FOR SELECT USING (is_published = true OR (select auth.uid()) = user_id);

CREATE POLICY "Users can manage own lost and found items" ON public.lost_and_found
FOR ALL USING ((select auth.uid()) = user_id);

-- Indexes for performance
CREATE INDEX idx_lost_and_found_user_id ON public.lost_and_found(user_id);

-- Services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    image_url TEXT,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on services table
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services
CREATE POLICY "Users can view published services" ON public.services
FOR SELECT USING (is_published = true OR (select auth.uid()) = user_id);

CREATE POLICY "Users can manage own services" ON public.services
FOR ALL USING ((select auth.uid()) = user_id);

-- Indexes for performance
CREATE INDEX idx_services_user_id ON public.services(user_id);


-- Create notices table
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    urgency TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Create policies to restrict access
CREATE POLICY "Users can view published notices" ON notices
    FOR SELECT USING (is_published = true);

CREATE POLICY "Users can manage their own notices" ON notices
    FOR ALL USING ((select auth.uid()) = user_id);

-- Create an index on the user_id for better performance
CREATE INDEX idx_notices_user_id ON notices(user_id);