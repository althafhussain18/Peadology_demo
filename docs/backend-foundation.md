# Backend Foundation (Prisma + Tenant APIs)

## Prisma setup
1. Install dependencies:
   - `npm install`
2. Copy env:
   - `cp .env.example .env`
3. Run migration:
   - `npm run prisma:migrate`
4. Generate client:
   - `npm run prisma:generate`
5. Seed sample data:
   - `npm run prisma:seed`

## Session expectation for API routes
Current API examples read the logged-in user id from request header:
- `x-user-id: <users.id>`

The route resolves `school_id` and `role` from DB using this user id, then applies tenant filtering automatically.

## Example routes
- `GET /api/students`
- `GET /api/teachers/me/students`
- `GET /api/content?type=VIDEO&subjectCode=SCIENCE`

## Behavior
- All queries are constrained by `school_id` from resolved session user.
- Teachers only get students from their assigned subjects.
- Non-admin users only get published content from `/api/content`.
