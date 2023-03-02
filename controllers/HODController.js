
import { FacultyModel } from "../models/FacultyModel.js"
import { RequestsModel } from "../models/RequestsModel.js"


///////////////////////  ADMIN MODULE ///////////////////////




///////////////////////  USERS MODULE ///////////////////////



///////////////////////  STUDENTS MODULE ///////////////////////



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


/////////////////////// PROFILE ////////////////////////////
export const getProfile = async (req, res) => {

    try {

        let { facultyId } = req.query, toId = null, staff = null
        //Get the fa details
        let profile = await FacultyModel.find({ _id: facultyId }, { __v: 0, createdAt: 0, updatedAt: 0 })
        profile = profile[0]
    
        //checking whether the fa has made any request
        let isRequestMade = await RequestsModel.find({ from: facultyId }, { done: 1 })

        //storing whether the fa can make request or not
        let canRequest = (isRequestMade) ? true : false

        staff = await FacultyModel.find({ admin: true }, { _id: 1 })
        toId = staff[0]._id

        res.status(200).json({...profile.toObject(), canRequest: canRequest, toId: toId })

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }

}

/////////////////////// REQUEST MODULE ///////////////////////
export const profileRequest = async (req, res) => {

    try {

        let request = req.body

        await RequestsModel.create(request)

        res.status(200).send("Requested successfully!")

    } catch (err) { res.status(400).send('Request Failed: ' + err.message) }
}

export const getRequests = async (req, res) => {

    try {

        let {facultyId} = req.query

        let requests = await RequestsModel.find({to: facultyId}, {__v: 0, createdAt:0, updatedAt:0}).sort({createdAt:'desc'})

        res.status(200).json(requests)


    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}

export const updateFacultyProfile = async (req, res) => {

    try {

        let data = req.body
        console.log(data)
        if(data.approved){

            await FacultyModel.updateOne({_id: data.from}, data.body)
 
        }
        data.done=true

        let id = data._id

        delete data._id
         
        await RequestsModel.updateOne({_id:id}, data)

        res.status(200).send("Request updated successfully!")

    } catch(err) { res.status(400).send('Request Failed: '+ err.message) }
}