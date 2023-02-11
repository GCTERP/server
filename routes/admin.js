import express from "express"

import { getFaculty, getFacultyUser, getStudents, getStudentUsers, manageFacultyAccount, manageStudentAccount, updateFaculty, updateStudents, uploadFaculty, uploadStudents } from "../controllers/AdminController.js"

const router = express.Router()

///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////
router.get("/users/students", getStudentUsers)

router.post("/users/manage/students", manageStudentAccount)

router.get("/users/faculty", getFacultyUser)

router.post("/users/manage/faculty", manageFacultyAccount)

///////////////////////  STUDENTS MODULE ///////////////////////
router.get("/students", getStudents)

router.post("/update/students", updateStudents)

router.post("/upload/students", uploadStudents)


///////////////////////  FACULTY MODULE ///////////////////////
router.post("/upload/faculty", uploadFaculty)

router.post("/update/faculty", updateFaculty)

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