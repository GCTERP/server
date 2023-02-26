import express from "express"

import { addWorkingDay, createCalendar, createMetadata, declareHoliday, downloadStudents, enrollment_Admin_GetEnrollmentStatus,enrollment_Admin_ModifyEnrollmentStatus,enrollment_Admin_GetEnrolledStudentsList,enrollment_Admin_AproveStudents,enrollment_Admin_AddStudents,enrollment_Admin_RemoveStudents, extendSemesterDuration, getAllDates, getBatch, getBranch, getBranchCache, getCurriculum, getElectives, getFaculty, getFacultyUser, getMetadata, getRegulation, getStudents, getStudentUsers, manageBatchInCalendar, manageBranch, manageElectives, manageFacultyAccount, manageSaturday, manageStudentAccount, updateCurriculum, updateFaculty, updateMetadata, updateStudent, uploadCurriculum, uploadFaculty, uploadStudents } from "../controllers/AdminController.js"

const router = express.Router()

///////////////////////  CACHE ///////////////////////

// Batch cache
router.get("/batch", getBatch)

router.get("/branch/cache", getBranchCache)

router.get("/regulation", getRegulation)


///////////////////////  ADMIN MODULE ///////////////////////

// Calendar Module
router.post("/calendar/create", createCalendar)

router.post("/calendar/holiday", declareHoliday)

router.post("/calendar/workingday", addWorkingDay)

router.post("/calendar/extend", extendSemesterDuration)

router.get("/calendar", getAllDates)

router.put("/calendar/manage/batch", manageBatchInCalendar)

router.put("/calendar/manage/saturday", manageSaturday)

// SemesterMetadata Module
router.post("/semestermeta/create", createMetadata)

router.get("/semestermeta", getMetadata)

router.put("/semestermeta/update", updateMetadata)

// Branch Module
router.post("/branch/manage", manageBranch)

router.get("/branch", getBranch)

// Electives Module
router.post("/electives/manage", manageElectives)

router.get("/electives", getElectives)


///////////////////////  USERS MODULE ///////////////////////
router.get("/users/students", getStudentUsers)

router.put("/users/manage/students", manageStudentAccount)

router.get("/users/faculty", getFacultyUser)

router.put("/users/manage/faculty", manageFacultyAccount)


///////////////////////  STUDENTS MODULE ///////////////////////
router.get("/students", getStudents)

router.put("/student/update", updateStudent)

router.post("/students/upload", uploadStudents)

router.get("/students/download", downloadStudents)


///////////////////////  FACULTY MODULE ///////////////////////
router.post("/faculty/upload", uploadFaculty)

router.put("/faculty/update", updateFaculty)

router.get("/faculty", getFaculty)


/////////////////////// CURRICULUM MODULE ///////////////////////
router.post("/curriculum/upload", uploadCurriculum)

router.get("/curriculum", getCurriculum)

router.put("/curriculum/update", updateCurriculum)


/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////
router.route("/enrolment").get(enrollment_Admin_GetEnrollmentStatus)

router.route("/enrolment/modifystatus").post(enrollment_Admin_ModifyEnrollmentStatus)

router.route("/enrolment/getdata").get(enrollment_Admin_GetEnrolledStudentsList)

router.route("/enrolment/approve").post(enrollment_Admin_AproveStudents)

router.route("/enrolment/addstudents").post(enrollment_Admin_AddStudents)

router.route("/enrolment/removestudents").post(enrollment_Admin_RemoveStudents)



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



export default router