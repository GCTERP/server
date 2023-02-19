import express from "express"

import { addWorkingDay, createCalendar, createMetadata, declareHoliday, downloadStudents, extendSemesterDuration, getAllDates, getBatchCache, getFaculty, getFacultyUser, getMetadata, getStudents, getStudentUsers, manageBatchInCalendar, manageFacultyAccount, manageSaturday, manageStudentAccount, updateFaculty, updateMetadata, updateStudent, uploadFaculty, uploadStudents } from "../controllers/AdminController.js"

const router = express.Router()

///////////////////////  CACHE ///////////////////////

// Batch cache
router.get("/batch", getBatchCache)


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


///////////////////////  USERS MODULE ///////////////////////
router.get("/users/students", getStudentUsers)

router.put("/users/manage/students", manageStudentAccount)

router.get("/users/faculty", getFacultyUser)

router.put("/users/manage/faculty", manageFacultyAccount)


///////////////////////  STUDENTS MODULE ///////////////////////
router.get("/students", getStudents)

router.put("/update/student", updateStudent)

router.post("/upload/students", uploadStudents)

router.get("/download/students", downloadStudents)


///////////////////////  FACULTY MODULE ///////////////////////
router.post("/upload/faculty", uploadFaculty)

router.put("/update/faculty", updateFaculty)

router.get("/faculty", getFaculty)


/////////////////////// CURRICULUM MODULE ///////////////////////



/////////////////////// TIMETABLE MODULE ///////////////////////



/////////////////////// ATTENDANCE MODULE ///////////////////////



/////////////////////// HALLTICKET MODULE ///////////////////////



/////////////////////// ENROLLMENT MODULE ///////////////////////



/////////////////////// RESULT MODULE ///////////////////////



/////////////////////// REGISTRATION MODULE ///////////////////////



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



export default router