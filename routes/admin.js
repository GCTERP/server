import express from "express"

import { uploadStudents } from "../controllers/AdminController.js"

const router = express.Router()

///////////////////////  ADMIN MODULE ///////////////////////



///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////
router.post("/upload/students", uploadStudents)


///////////////////////  FACULTY MODULE ///////////////////////



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