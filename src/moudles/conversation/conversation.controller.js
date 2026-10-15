import { Router } from "express";
import { authentication } from "../../middleware/authentication/authentication.middleware.js";
import { getConversationMessages, getConversations, sendConversationMessage } from "./conversation.sevice.js";
import { sucessresponse } from "../../common/utlis/success.response.js";
import { validation } from "../../middleware/validation/validation.middleware.js";
import * as conversationValidation from "./conversation.validation.js";

const router=Router()


// My Conversations
router.get("/",authentication(),async(req,res,next)=>{
    const data=await getConversations(req.user._id)
    return sucessresponse({res,data})
})


// Send Message Inside Conversation
router.post("/:conversationId/messages",authentication(),validation(conversationValidation.sendConversationMessage),async(req,res,next)=>{
    const data=await sendConversationMessage(req.user._id,req.params.conversationId,req.body.content)
    return sucessresponse({res,data,status:201})
})


// Get Conversation Messages
router.get("/:conversationId/messages",authentication(),validation(conversationValidation.getConversationMessages),async(req,res,next)=>{
    const data=await getConversationMessages(req.user._id,req.params.conversationId)
    return sucessresponse({res,data})
})


export default router
