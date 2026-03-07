-- RBAC + school-tenant sample seed data
-- Includes:
-- - 10 schools
-- - 1 global admin
-- - Per school: 4 teachers, 10 students, 10 parents
-- - Parent-child links (1 parent per student)
--
-- Run:
--   psql "<your_postgres_connection_string>" -f data/seed-rbac.sql

BEGIN;

CREATE TABLE IF NOT EXISTS schools (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  board TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_code TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STUDENT', 'TEACHER', 'PARENT')),
  school_id INT REFERENCES schools(id) ON DELETE CASCADE,
  password_plain TEXT NOT NULL DEFAULT 'Pass@123',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parent_child_links (
  id SERIAL PRIMARY KEY,
  parent_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'Parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_id, child_id)
);

-- Clear only seeded-style data if re-running locally
DELETE FROM parent_child_links;
DELETE FROM users;
DELETE FROM schools;

INSERT INTO schools (name, board, city, state) VALUES
  ('Green Valley Public School', 'CBSE', 'Bengaluru', 'Karnataka'),
  ('Sunrise International School', 'ICSE', 'Hyderabad', 'Telangana'),
  ('Riverdale Academy', 'State Board', 'Chennai', 'Tamil Nadu'),
  ('Maple Leaf School', 'CBSE', 'Pune', 'Maharashtra'),
  ('Blue Ridge High School', 'ICSE', 'Kochi', 'Kerala'),
  ('Harmony Scholars School', 'State Board', 'Jaipur', 'Rajasthan'),
  ('Crescent Modern School', 'CBSE', 'Lucknow', 'Uttar Pradesh'),
  ('Pinecrest Learning Center', 'ICSE', 'Ahmedabad', 'Gujarat'),
  ('Starlight Senior School', 'State Board', 'Bhopal', 'Madhya Pradesh'),
  ('Oakwood Public Academy', 'CBSE', 'Kolkata', 'West Bengal');

-- Global admin (no school_id)
INSERT INTO users (user_code, full_name, email, role, school_id, password_plain)
VALUES ('ADMIN_1', 'Platform Admin', 'admin@learnquest.local', 'ADMIN', NULL, 'Admin@123');

-- Teachers: 4 per school
INSERT INTO users (user_code, full_name, email, role, school_id, password_plain)
SELECT
  'T' || s.id || '_' || t.n,
  'Teacher ' || s.id || '-' || t.n,
  'teacher' || s.id || '_' || t.n || '@school.local',
  'TEACHER',
  s.id,
  'Teacher@123'
FROM schools s
CROSS JOIN generate_series(1, 4) AS t(n);

-- Students: 10 per school
INSERT INTO users (user_code, full_name, email, role, school_id, password_plain)
SELECT
  'S' || s.id || '_' || st.n,
  'Student ' || s.id || '-' || st.n,
  'student' || s.id || '_' || st.n || '@school.local',
  'STUDENT',
  s.id,
  'Student@123'
FROM schools s
CROSS JOIN generate_series(1, 10) AS st(n);

-- Parents: 10 per school
INSERT INTO users (user_code, full_name, email, role, school_id, password_plain)
SELECT
  'P' || s.id || '_' || p.n,
  'Parent ' || s.id || '-' || p.n,
  'parent' || s.id || '_' || p.n || '@school.local',
  'PARENT',
  s.id,
  'Parent@123'
FROM schools s
CROSS JOIN generate_series(1, 10) AS p(n);

-- One parent linked to one student per index within same school
INSERT INTO parent_child_links (parent_id, child_id, relationship)
SELECT
  p.id AS parent_id,
  st.id AS child_id,
  'Parent'
FROM users p
JOIN users st
  ON st.school_id = p.school_id
 AND st.role = 'STUDENT'
 AND replace(st.user_code, 'S', '') = replace(p.user_code, 'P', '')
WHERE p.role = 'PARENT';

COMMIT;
