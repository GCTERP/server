import express from "express"

import { addFaculty, addWorkingDay, downloadFaculty, getProfile, getRequests, updateProfile, updateRequests, CE_Admin_addstudents, CE_Admin_approvestudents, CE_Admin_getenrolledstudentslist, CE_Admin_removestudents, createCalendar, createMetadata, CR_Admin_addstudents, CR_Admin_approvestudents, CR_Admin_getRegisteredstudentslist, CR_Admin_removestudents, declareHoliday, downloadStudents, extendSemesterDuration, getAllDates, getBatch, getBranch, getBranchCache, getCurriculum, getElectives, getFaculty, getFacultyUser, getMetadata, getRegulation, manageBatchInCalendar, manageBranch, manageElectives, manageFacultyAccount, manageSaturday, manageStudentAccount, Result_Admin_GetResults, Result_Admin_Upload, updateCurriculum, updateFaculty, updateMetadata, updateStudent, uploadCurriculum, uploadFaculty, uploadStudents, getStudentUsers, getStudents } from "../controllers/AdminController.js"

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

router.route("/enrolment/getdata").get(CE_Admin_getenrolledstudentslist)

router.route("/enrolment/approve").post(CE_Admin_approvestudents)

router.route("/enrolment/addstudents").post(CE_Admin_addstudents)

router.route("/enrolment/removestudents").post(CE_Admin_removestudents)



/////////////////////// RESULT MODULE ///////////////////////

router.route("/result").post(Result_Admin_GetResults)

router.route("/result/upload").post(Result_Admin_Upload)


/////////////////////// REGISTRATION MODULE ///////////////////////

router.route("/courseregistration/getdata").get(CR_Admin_getRegisteredstudentslist)

router.route("/courseregistration/approve").post(CR_Admin_approvestudents)

router.route("/courseregistration/addstudents").post(CR_Admin_addstudents)

router.route("/courseregistration/removestudents").post(CR_Admin_removestudents)



/////////////////////// EXAM FEE MODULE ///////////////////////



/////////////////////// EXAMINERS PANEL MODULE ///////////////////////



/////////////////////// COURSE ATTAINMENT MODULE ///////////////////////



/////////////////////// INTERNALS MODULE ///////////////////////



/////////////////////// FEEDBACK MODULE ///////////////////////



/////////////////////// PROFILE ////////////////////////
router.get("/profile", getProfile)

router.put("/profile/update", updateProfile)

export default router