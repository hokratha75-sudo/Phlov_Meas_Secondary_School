-- ============================================================================
-- 01. DATABASE ROLES
-- ============================================================================

-- Create roles based on application users
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_admin') THEN
        CREATE ROLE app_admin NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_teacher') THEN
        CREATE ROLE app_teacher NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_parent') THEN
        CREATE ROLE app_parent NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'readonly') THEN
        CREATE ROLE readonly NOLOGIN;
    END IF;
END $$;

-- Grant minimum privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON students TO app_teacher;
GRANT SELECT ON students TO app_parent;
GRANT SELECT ON audit_log TO app_admin;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_teacher;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- Note: In production, create specific login users and grant these roles to them.
-- Example: 
-- CREATE USER teacher1 WITH PASSWORD 'securepass';
-- GRANT app_teacher TO teacher1;
