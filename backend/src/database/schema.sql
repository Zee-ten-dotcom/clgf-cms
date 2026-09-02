CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CLGF CMS DATABASE SCHEMA
-- The City Of The Living God Fellowship
--
-- Authoritative schema snapshot based on the live PostgreSQL
-- database structure audited on 2026-08-29.
--
-- This file defines STRUCTURE ONLY. It does not contain church
-- member data, user passwords, giving records, or other data.
-- ============================================================

-- ============================================================
-- MEMBERS
-- ============================================================

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_number VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(255),
  date_of_birth DATE,
  address TEXT,
  gender VARCHAR(30),
  marital_status VARCHAR(30),
  joined_at DATE,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS users_member_id_unique
  ON users(member_id)
  WHERE member_id IS NOT NULL;

-- ============================================================
-- MINISTRIES
-- ============================================================

CREATE TABLE IF NOT EXISTS ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  leader_id UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- HOME CELLS
-- ============================================================

CREATE TABLE IF NOT EXISTS home_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  location TEXT,
  leader_id UUID REFERENCES members(id) ON DELETE SET NULL,
  meeting_day VARCHAR(30),
  meeting_time VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LEGACY ATTENDANCE
-- Retained because it exists in the live database.
-- ============================================================

-- ============================================================
-- ATTENDANCE SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_date DATE NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE RECORDS
-- ============================================================

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL
    REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL
    REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (session_id, member_id)
);

-- ============================================================
-- EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type VARCHAR(80),
  status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
  attendance_session_id UUID
    REFERENCES attendance_sessions(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_event_date
  ON events(event_date);

CREATE INDEX IF NOT EXISTS idx_events_event_type
  ON events(event_type);

CREATE INDEX IF NOT EXISTS idx_events_status
  ON events(status);

-- ============================================================
-- SERMONS & RESOURCES
-- ============================================================

CREATE TABLE IF NOT EXISTS sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  speaker VARCHAR(150) NOT NULL,
  scripture VARCHAR(255),
  sermon_date DATE NOT NULL,
  description TEXT,
  video_url TEXT,
  audio_url TEXT,
  notes_url TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sermons_sermon_date
  ON sermons(sermon_date);

CREATE INDEX IF NOT EXISTS idx_sermons_status
  ON sermons(status);

CREATE INDEX IF NOT EXISTS idx_sermons_featured
  ON sermons(featured);

-- ============================================================
-- FINANCE TRANSACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE NOT NULL,
  transaction_type VARCHAR(20) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount NUMERIC(12,2) NOT NULL
    CHECK (amount >= 0),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GIVING RECORDS
-- ============================================================

CREATE TABLE IF NOT EXISTS giving_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID
    REFERENCES members(id) ON DELETE SET NULL,
  giving_date DATE NOT NULL,
  giving_type VARCHAR(50) NOT NULL,
  amount NUMERIC(12,2) NOT NULL
    CHECK (amount > 0),
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  notes TEXT,
  finance_transaction_id UUID
    REFERENCES finance_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_giving_records_date
  ON giving_records(giving_date);

CREATE INDEX IF NOT EXISTS idx_giving_records_member_id
  ON giving_records(member_id);

-- ============================================================
-- LEADERSHIP
-- ============================================================

CREATE TABLE IF NOT EXISTS leadership_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL
    REFERENCES members(id) ON DELETE CASCADE,
  ministry_id UUID
    REFERENCES ministries(id) ON DELETE SET NULL,
  role_title VARCHAR(120) NOT NULL,
  role_type VARCHAR(50) NOT NULL DEFAULT 'MINISTRY',
  responsibility TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
    CHECK (
      status IN (
        'ACTIVE',
        'INACTIVE',
        'ON_LEAVE',
        'COMPLETED'
      )
    ),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leadership_member
  ON leadership_assignments(member_id);

CREATE INDEX IF NOT EXISTS idx_leadership_ministry
  ON leadership_assignments(ministry_id);

CREATE INDEX IF NOT EXISTS idx_leadership_role
  ON leadership_assignments(role_title);

CREATE INDEX IF NOT EXISTS idx_leadership_status
  ON leadership_assignments(status);

-- ============================================================
-- PASTORAL CARE
-- ============================================================

CREATE TABLE IF NOT EXISTS pastoral_care_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL
    REFERENCES members(id) ON DELETE CASCADE,
  care_type VARCHAR(50) NOT NULL,
  subject VARCHAR(200),
  notes TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL'
    CHECK (
      priority IN (
        'LOW',
        'NORMAL',
        'HIGH',
        'URGENT'
      )
    ),
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN'
    CHECK (
      status IN (
        'OPEN',
        'IN_PROGRESS',
        'FOLLOW_UP',
        'COMPLETED',
        'CLOSED'
      )
    ),
  assigned_leader_id UUID
    REFERENCES members(id) ON DELETE SET NULL,
  care_date DATE NOT NULL DEFAULT CURRENT_DATE,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pastoral_care_assigned_leader
  ON pastoral_care_records(assigned_leader_id);

CREATE INDEX IF NOT EXISTS idx_pastoral_care_follow_up
  ON pastoral_care_records(follow_up_date);

CREATE INDEX IF NOT EXISTS idx_pastoral_care_member
  ON pastoral_care_records(member_id);

CREATE INDEX IF NOT EXISTS idx_pastoral_care_status
  ON pastoral_care_records(status);

-- ============================================================
-- PRAYER REQUESTS
-- Retained because it exists in the live database.
-- ============================================================

-- ============================================================
-- LEGACY OFFERINGS
-- Retained because it exists in the live database.
-- ============================================================

-- ============================================================
-- LEGACY EXPENSES
-- Retained because it exists in the live database.
-- ============================================================

-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID
    REFERENCES users(id) ON DELETE SET NULL,
  actor_email VARCHAR(255),
  actor_name VARCHAR(255),
  actor_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
  ON audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
  ON audit_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_module
  ON audit_logs(module);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
  ON audit_logs(user_id);

-- ============================================================
-- PUBLIC PRAYER REQUESTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public_prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name VARCHAR(120) NOT NULL,
  contact VARCHAR(255),
  prayer_request TEXT NOT NULL,
  confidential BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN'
    CHECK (
      status IN (
        'OPEN',
        'IN_PROGRESS',
        'PRAYED_FOR',
        'FOLLOW_UP',
        'CLOSED'
      )
    ),
  source VARCHAR(50) NOT NULL DEFAULT 'WEBSITE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_prayer_requests_status
  ON public_prayer_requests(status);

CREATE INDEX IF NOT EXISTS idx_public_prayer_requests_created_at
  ON public_prayer_requests(created_at DESC);
