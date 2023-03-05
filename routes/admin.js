import express from "express"

import { addFaculty, addWorkingDay, createCalendar, createMetadata, declareHoliday, downloadFaculty, downloadStudents, extendSemesterDuration, getAllDates, getBatch, getBranch, getBranchCache, getCurriculum, getElectives, getFaculty, getFacultyAdvisor, getFacultyUser, getFAMeta, getMetadata, getMinMaxDate, getProfile, getRegulation, getRequests, getStudents, getStudentUsers, manageBatchInCalendar, manageBranch, manageElectives, manageFacultyAccount, manageSaturday, manageStudentAccount, updateCurriculum, updateFaculty, updateMetadata, updateProfile, updateRequests, updateStudent, uploadCurriculum, uploadFaculty, uploadStudents } from "../controllers/AdminController.js"

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

router.get("/calendar/minmaxdate", getMinMaxDate)

// SemesterMetadata Module
router.post("/semestermeta/create", createMetadata)

router.get("/semestermeta", getMetadata)

router.put("/semestermeta/update", updateMetadata)

router.get("/semestermeta/fa", getFAMeta)

// Branch Module
router.post("/branch/manage", manageBranch)

router.get("/branch", getBranch)

// Electives Module
router.post("/electives/manage", manageElectives)

router.get("/electives", getElectives)


///////////////////////  USERS MODULE ///////////////////////
router.get("/users/students", getStudentUsers)

router.put("/users/students/manage", manageStudentAccount)

router.get("/users/faculty", getFacultyUser)

router.put("/users/faculty/manage", manageFacultyAccount)


///////////////////////  STUDENTS MODULE ///////////////////////
router.get("/students", getStudents)

router.put("/student/update", updateStudent)

router.post("/students/upload", uploadStudents)

router.get("/students/download", downloadStudents)


///////////////////////  FACULTY MODULE ///////////////////////
router.post("/faculty/upload", uploadFaculty)

router.put("/faculty/update", updateFaculty)

router.get("/faculty/download", downloadFaculty)

router.get("/faculty", getFaculty)

router.post("/faculty/add", addFaculty)

router.get("/faculty/fa", getFacultyAdvisor)

/////////////////////// CURRICULUM MODULE ///////////////////////
router.post("/curriculum/upload", uploadCurriculum)

router.get("/curriculum", getCurriculum)

router.put("/curriculum/update", updateCurriculum)


/////////////////////// REQUEST MODULE ////////////////////////////

router.get("/requests", getRequests)

router.put("/requests/update", updateRequests)


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



/////////////////////// PROFILE ////////////////////////
router.get("/profile", getProfile)

router.put("/profile/update", updateProfile)

export default router