import { Router } from "express";
import { authentication } from "../../middleware/authentication/authentication.middleware.js";
import { deleteMessage, getMessages, getRequests, requestSenderIdentity, respondToRequest, sendMessage } from "./message.sevice.js";
import { sucessresponse } from "../../common/utlis/success.response.js";
import { validation } from "../../middleware/validation/validation.middleware.js";
import * as messageValidation from "./message.validation.js";

const router=Router()


// 3. Get Requests
router.get("/requests",authentication(),async(req,res,next)=>{
    const data=await getRequests(req.user._id)
    return sucessresponse({res,data})
})


// 4. Accept Or Reject Request
router.patch("/requests/:requestId",authentication(),validation(messageValidation.respondToRequest),async(req,res,next)=>{
    const data=await respondToRequest(req.user._id,req.params.requestId,req.body.status)
    return sucessresponse({res,data})
})


// 1. Send Anonymous Message
router.post("/:receiverId",authentication(),validation(messageValidation.sendMessage),async(req,res,next)=>{
    const data=await sendMessage(req.user._id,req.params.receiverId,req.body.content)
    return sucessresponse({res,data,status:201})
})


// 2. Request Sender Identity
router.post("/:messageId/request-identity",authentication(),validation(messageValidation.requestSenderIdentity),async(req,res,next)=>{
    const data=await requestSenderIdentity(req.user._id,req.params.messageId)
    return sucessresponse({res,data,status:201})
})


// Get Messages
router.get("/",authentication(),async(req,res,next)=>{
    const data=await getMessages(req.user._id)
    return sucessresponse({res,data})
})


// Delete Message
router.delete("/:messageId",authentication(),validation(messageValidation.deleteMessage),async(req,res,next)=>{
    const data=await deleteMessage(req.user._id,req.params.messageId)
    return sucessresponse({res,data})
})


export default router
