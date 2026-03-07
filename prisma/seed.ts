import {
  PrismaClient,
  ContentStatus,
  ContentType,
  EnrollmentStatus,
  FeedbackStatus,
  ParentRelationship,
  RecordStatus,
  StudentActivityType,
  UserRole,
} from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  await prisma.parentFeedback.deleteMany()
  await prisma.studentContentActivity.deleteMany()
  await prisma.studentLessonProgress.deleteMany()
  await prisma.studentCourseEnrollment.deleteMany()
  await prisma.parentStudentLink.deleteMany()
  await prisma.studentSubject.deleteMany()
  await prisma.teacherSubject.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.contentItem.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.user.deleteMany()
  await prisma.school.deleteMany()

  const school = await prisma.school.create({
    data: {
      name: "Green Valley Public School",
      code: "GVPS-001",
      status: RecordStatus.ACTIVE,
    },
  })

  const [mathSubject, scienceSubject] = await Promise.all([
    prisma.subject.create({
      data: {
        schoolId: school.id,
        name: "Mathematics",
        code: "MATH",
        status: RecordStatus.ACTIVE,
      },
    }),
    prisma.subject.create({
      data: {
        schoolId: school.id,
        name: "Science",
        code: "SCIENCE",
        status: RecordStatus.ACTIVE,
      },
    }),
  ])

  const [adminPassword, teacherPassword, studentPassword, parentPassword] = await Promise.all([
    bcrypt.hash("Admin@123", 10),
    bcrypt.hash("Teacher@123", 10),
    bcrypt.hash("Student@123", 10),
    bcrypt.hash("Parent@123", 10),
  ])

  const admin = await prisma.user.create({
    data: {
      schoolId: school.id,
      fullName: "Admin User",
      email: "admin@gvps.local",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      status: RecordStatus.ACTIVE,
    },
  })

  const [teacherMath, teacherScience] = await Promise.all([
    prisma.user.create({
      data: {
        schoolId: school.id,
        fullName: "Meera Nair",
        email: "teacher.math@gvps.local",
        passwordHash: teacherPassword,
        role: UserRole.TEACHER,
        status: RecordStatus.ACTIVE,
      },
    }),
    prisma.user.create({
      data: {
        schoolId: school.id,
        fullName: "Ravi Sharma",
        email: "teacher.science@gvps.local",
        passwordHash: teacherPassword,
        role: UserRole.TEACHER,
        status: RecordStatus.ACTIVE,
      },
    }),
  ])

  await prisma.teacherSubject.createMany({
    data: [
      { schoolId: school.id, teacherId: teacherMath.id, subjectId: mathSubject.id },
      { schoolId: school.id, teacherId: teacherScience.id, subjectId: scienceSubject.id },
    ],
  })

  const [student1, student2, student3] = await Promise.all([
    prisma.user.create({
      data: {
        schoolId: school.id,
        fullName: "Ayaan Verma",
        email: "student1@gvps.local",
        passwordHash: studentPassword,
        role: UserRole.STUDENT,
        status: RecordStatus.ACTIVE,
      },
    }),
    prisma.user.create({
      data: {
        schoolId: school.id,
        fullName: "Diya Kapoor",
        email: "student2@gvps.local",
        passwordHash: studentPassword,
        role: UserRole.STUDENT,
        status: RecordStatus.ACTIVE,
      },
    }),
    prisma.user.create({
      data: {
        schoolId: school.id,
        fullName: "Kabir Iyer",
        email: "student3@gvps.local",
        passwordHash: studentPassword,
        role: UserRole.STUDENT,
        status: RecordStatus.ACTIVE,
      },
    }),
  ])

  await prisma.studentProfile.createMany({
    data: [
      { schoolId: school.id, userId: student1.id, grade: "Grade 5", section: "A", rollNumber: "G5A-01" },
      { schoolId: school.id, userId: student2.id, grade: "Grade 5", section: "A", rollNumber: "G5A-02" },
      { schoolId: school.id, userId: student3.id, grade: "Grade 5", section: "B", rollNumber: "G5B-01" },
    ],
  })

  await prisma.studentSubject.createMany({
    data: [
      { schoolId: school.id, studentId: student1.id, subjectId: mathSubject.id },
      { schoolId: school.id, studentId: student1.id, subjectId: scienceSubject.id },
      { schoolId: school.id, studentId: student2.id, subjectId: mathSubject.id },
      { schoolId: school.id, studentId: student3.id, subjectId: scienceSubject.id },
    ],
  })

  const parent = await prisma.user.create({
    data: {
      schoolId: school.id,
      fullName: "Neha Verma",
      email: "parent1@gvps.local",
      passwordHash: parentPassword,
      role: UserRole.PARENT,
      status: RecordStatus.ACTIVE,
    },
  })

  await prisma.parentStudentLink.create({
    data: {
      schoolId: school.id,
      parentId: parent.id,
      studentId: student1.id,
      relationship: ParentRelationship.MOTHER,
    },
  })

  await prisma.contentItem.createMany({
    data: [
      {
        schoolId: school.id,
        subjectId: mathSubject.id,
        createdById: teacherMath.id,
        type: ContentType.LESSON,
        status: ContentStatus.PUBLISHED,
        title: "Fractions Basics",
        description: "Understand numerator and denominator with examples.",
        metadata: { duration: "20 min", level: "Beginner" },
      },
      {
        schoolId: school.id,
        subjectId: scienceSubject.id,
        createdById: teacherScience.id,
        type: ContentType.VIDEO,
        status: ContentStatus.PUBLISHED,
        title: "Plant Life Cycle Video",
        description: "Seed to plant growth explained.",
        metadata: { duration: "14 min", language: "English" },
      },
      {
        schoolId: school.id,
        subjectId: mathSubject.id,
        createdById: admin.id,
        type: ContentType.BOOK,
        status: ContentStatus.PUBLISHED,
        title: "Mental Math Workbook",
        description: "Practice workbook for grade 5.",
        metadata: { pages: 120, edition: "2026" },
      },
    ],
  })

  const seededContent = await prisma.contentItem.findMany({
    where: { schoolId: school.id },
    select: { id: true, title: true, type: true },
  })

  const mathVideo = seededContent.find((item) => item.type === ContentType.VIDEO)
  const mathBook = seededContent.find((item) => item.type === ContentType.BOOK)
  const mathLesson = seededContent.find((item) => item.type === ContentType.LESSON)

  await prisma.studentCourseEnrollment.createMany({
    data: [
      {
        schoolId: school.id,
        studentId: student1.id,
        courseId: "mathematics",
        status: EnrollmentStatus.ACTIVE,
      },
      {
        schoolId: school.id,
        studentId: student1.id,
        courseId: "science",
        status: EnrollmentStatus.ACTIVE,
      },
      {
        schoolId: school.id,
        studentId: student2.id,
        courseId: "mathematics",
        status: EnrollmentStatus.ACTIVE,
      },
      {
        schoolId: school.id,
        studentId: student3.id,
        courseId: "science",
        status: EnrollmentStatus.ACTIVE,
      },
    ],
  })

  await prisma.studentLessonProgress.createMany({
    data: [
      {
        schoolId: school.id,
        studentId: student1.id,
        courseId: "mathematics",
        lessonId: "math-1",
        progressPct: 100,
        completed: true,
      },
      {
        schoolId: school.id,
        studentId: student1.id,
        courseId: "mathematics",
        lessonId: "math-2",
        progressPct: 65,
        completed: false,
      },
      {
        schoolId: school.id,
        studentId: student1.id,
        courseId: "science",
        lessonId: "sci-1",
        progressPct: 40,
        completed: false,
      },
      {
        schoolId: school.id,
        studentId: student2.id,
        courseId: "mathematics",
        lessonId: "math-1",
        progressPct: 80,
        completed: false,
      },
      {
        schoolId: school.id,
        studentId: student3.id,
        courseId: "science",
        lessonId: "sci-1",
        progressPct: 55,
        completed: false,
      },
    ],
  })

  if (mathVideo && mathBook && mathLesson) {
    await prisma.studentContentActivity.createMany({
      data: [
        {
          schoolId: school.id,
          studentId: student1.id,
          contentItemId: mathVideo.id,
          activityType: StudentActivityType.WATCH_VIDEO,
          watchMinutes: 14,
        },
        {
          schoolId: school.id,
          studentId: student1.id,
          contentItemId: mathLesson.id,
          activityType: StudentActivityType.VIEW_LESSON,
          watchMinutes: 20,
        },
        {
          schoolId: school.id,
          studentId: student1.id,
          contentItemId: mathBook.id,
          activityType: StudentActivityType.OPEN_BOOK,
          watchMinutes: 18,
        },
      ],
    })
  }

  await prisma.parentFeedback.create({
    data: {
      schoolId: school.id,
      parentId: parent.id,
      studentId: student1.id,
      teacherId: teacherMath.id,
      subjectId: mathSubject.id,
      message: "Ayaan is struggling with fractions at home. Can we share revision worksheets?",
      status: FeedbackStatus.OPEN,
    },
  })

  console.log("Seed complete")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
