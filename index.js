import expressFile from "express-fileupload"
import mongoose from "mongoose"
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { createClient } from "redis"
import compression from "compression"
import helmet from "helmet"

import admin from "./routes/admin.js"
import hod from "./routes/hod.js"
import pc from "./routes/pc.js"
import ttc from "./routes/ttc.js"
import fa from "./routes/fa.js"
import ci from "./routes/ci.js"
import student from "./routes/student.js"
import auth from "./routes/auth.js"

dotenv.config()
const app = express()

// Middleware
app.use(express.json())
app.use(expressFile())
app.use(cors())
app.use(compression())
app.use(helmet())

// Request Logs
app.use('/', (req, res, next) => {
    console.log(req.method + " : " + req.path)
    next()
})

// Routes
app.use('/admin', admin)
app.use('/hod', hod)
app.use('/pc', pc)
app.use('/ttc', ttc)
app.use('/fa', fa)
app.use('/ci', ci)
app.use('/student', student)
app.use('/auth', auth)

export const redis = createClient()
// await redis.connect()

mongoose.connect(process.env.MONGO_URI)

app.listen(process.env.PORT, () => {
    console.log(`Connected to Database. App started @ ${process.env.PORT}...`)
})