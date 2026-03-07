# Seed Data (RBAC + Schools)

Use [`seed-rbac.sql`](/Users/althafab/Downloads/b_nWJuXlviHfB-1772878029380/data/seed-rbac.sql) after setting up PostgreSQL.

## What it creates
- 10 schools
- 1 admin user
- Per school:
  - 4 teachers
  - 10 students
  - 10 parents
- Parent-child links (1:1 by generated index)

## Run
```bash
psql "<your_postgres_connection_string>" -f data/seed-rbac.sql
```

## Quick verify
```sql
SELECT COUNT(*) AS schools FROM schools;
SELECT role, COUNT(*) FROM users GROUP BY role ORDER BY role;
SELECT COUNT(*) AS parent_child_links FROM parent_child_links;
```
