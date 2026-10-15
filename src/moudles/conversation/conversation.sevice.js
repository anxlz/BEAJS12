import { forbiddenException, notFoundException } from "../../common/execption/index.js"
import { createOne, find, findById } from "../../common/repository/index.js"
import { ConversationMessageModel, ConversationModel } from "../../DB/models/index.js"

// Only The Two Users Involved
const getConversationForUser=async(userId,conversationId)=>{
    const conversation=await findById({
        model:ConversationModel,
        id:conversationId
    })
    if(!conversation){
        notFoundException("conversation not found")
    }
    const isParticipant=[conversation.senderId,conversation.receiverId]
        .some((id)=>id.toString()===userId.toString())
    if(!isParticipant){
        forbiddenException("you are not part of this conversation")
    }
    return conversation
}

// My Conversations
export const getConversations=async(userId)=>{
    return await find({
        model:ConversationModel,
        filter:{
            $or:[{senderId:userId},{receiverId:userId}]
        },
        options:{
            sort:{createdAt:-1}
        }
    })
}

// 6. Send Message Inside Conversation
export const sendConversationMessage=async(userId,conversationId,content)=>{
    await getConversationForUser(userId,conversationId)
    return await createOne({
        model:ConversationMessageModel,
        data:{
            conversationId,
            senderId:userId,
            content
        }
    })
}

// 7. Get Conversation Messages
export const getConversationMessages=async(userId,conversationId)=>{
    const conversation=await getConversationForUser(userId,conversationId)
    const messages=await find({
        model:ConversationMessageModel,
        filter:{
            conversationId
        },
        options:{
            sort:{createdAt:1}
        }
    })
    return {conversation,messages}
}
