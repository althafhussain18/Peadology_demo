# Admin API (School-scoped)

All routes require header:

```http
x-user-id: <ADMIN_USER_ID>
```

Access control:
- Only `ADMIN` role can use these routes.
- Data is always filtered to admin's `school_id`.

## School
- `GET /api/admin/school`
- `PATCH /api/admin/school`

Example:
```bash
curl -X PATCH http://localhost:3000/api/admin/school \
  -H "Content-Type: application/json" \
  -H "x-user-id: <ADMIN_ID>" \
  -d '{"name":"Green Valley Public School Updated","code":"GVPS-001"}'
```

## Users
- `GET /api/admin/users`
- `GET /api/admin/users?role=STUDENT`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:userId`

Create user example:
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "x-user-id: <ADMIN_ID>" \
  -d '{"fullName":"New Teacher","email":"new.teacher@gvps.local","password":"Teacher@123","role":"TEACHER"}'
```

Create student with profile:
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "x-user-id: <ADMIN_ID>" \
  -d '{"fullName":"New Student","email":"new.student@gvps.local","password":"Student@123","role":"STUDENT","grade":"Grade 6","section":"A","rollNumber":"G6A-01"}'
```

## Subjects
- `GET /api/admin/subjects`
- `POST /api/admin/subjects`

## Assignments
- `POST /api/admin/teacher-subjects`
  - body: `{ "teacherId": "...", "subjectId": "..." }`
- `POST /api/admin/student-subjects`
  - body: `{ "studentId": "...", "subjectId": "..." }`
- `POST /api/admin/parent-student-links`
  - body: `{ "parentId": "...", "studentId": "...", "relationship": "MOTHER" }`

## Content
- `GET /api/admin/content`
- `POST /api/admin/content`

Create content example:
```bash
curl -X POST http://localhost:3000/api/admin/content \
  -H "Content-Type: application/json" \
  -H "x-user-id: <ADMIN_ID>" \
  -d '{"type":"VIDEO","subjectId":"<SUBJECT_ID>","title":"New Video","description":"Demo content"}'
```
