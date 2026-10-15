import { badRequestException, conflictException, notFoundException } from "../../common/execption/index.js"
import { createOne, deleteOne, find, findById } from "../../common/repository/index.js"
import { RequestStatusEnum } from "../../common/enum/index.js"
import { ConversationModel, IdentityRequestModel, MessageModel, UserModel } from "../../DB/models/index.js"

// Username From Lean User
const toUsername=(user)=>{
    return `${user.firstName} ${user.LastName}`
}

// 1. Send Anonymous Message
export const sendMessage=async(senderId,receiverId,content)=>{
    if(senderId.toString()===receiverId.toString()){
        badRequestException("you cannot send a message to yourself")
    }
    const receiver=await findById({
        model:UserModel,
        id:receiverId
    })
    if(!receiver || receiver.deletedAt){
        notFoundException("user not found")
    }
    const message=await createOne({
        model:MessageModel,
        data:{
            content,
            senderId,
            receiverId
        }
    })
    return message
}

// Get Messages (sender stays hidden unless request accepted)
export const getMessages=async(userId)=>{
    const messages=await find({
        model:MessageModel,
        filter:{
            receiverId:userId
        },
        options:{
            select:"-senderId",
            sort:{createdAt:-1},
            lean:true
        }
    })
    const requests=await find({
        model:IdentityRequestModel,
        filter:{
            receiverId:userId,
            messageId:{$in:messages.map((message)=>message._id)}
        },
        options:{
            populate:{path:"senderId",select:"firstName LastName email"},
            lean:true
        }
    })
    const requestByMessage=new Map(requests.map((request)=>[request.messageId.toString(),request]))

    return messages.map((message)=>{
        const result={...message}
        const request=requestByMessage.get(message._id.toString())
        if(request){
            result.identityRequest={_id:request._id,status:request.status}
            if(request.status===RequestStatusEnum.ACCEPTED && request.senderId){
                result.sender={
                    _id:request.senderId._id,
                    username:toUsername(request.senderId),
                    email:request.senderId.email
                }
            }
        }
        return result
    })
}

// Delete Message
export const deleteMessage=async(userId,messageId)=>{
    const message=await findById({
        model:MessageModel,
        id:messageId
    })
    if(!message || message.receiverId.toString()!==userId.toString()){
        notFoundException("message not found")
    }
    await deleteOne({
        model:MessageModel,
        filter:{_id:messageId}
    })
    // Keep Sender Hidden
    return {_id:message._id,content:message.content,receiverId:message.receiverId}
}

// 2. Request Sender Identity
export const requestSenderIdentity=async(userId,messageId)=>{
    const message=await findById({
        model:MessageModel,
        id:messageId
    })
    if(!message || message.receiverId.toString()!==userId.toString()){
        notFoundException("message not found")
    }
    if(!message.senderId){
        badRequestException("this message has no registered sender")
    }
    const oldRequest=await IdentityRequestModel.exists({messageId})
    if(oldRequest){
        conflictException("an identity request already exists for this message")
    }
    const request=await createOne({
        model:IdentityRequestModel,
        data:{
            messageId,
            senderId:message.senderId,
            receiverId:userId
        }
    })
    // Keep Sender Hidden
    return {_id:request._id,messageId:request.messageId,status:request.status,createdAt:request.createdAt}
}

// 3. Get Requests (received by the sender)
export const getRequests=async(userId)=>{
    const requests=await find({
        model:IdentityRequestModel,
        filter:{
            senderId:userId
        },
        options:{
            populate:[
                {path:"messageId",select:"content createdAt"},
                {path:"receiverId",select:"firstName LastName"}
            ],
            sort:{createdAt:-1},
            lean:true
        }
    })
    return requests.map((request)=>{
        return {
            _id:request._id,
            status:request.status,
            createdAt:request.createdAt,
            message:request.messageId && {
                _id:request.messageId._id,
                content:request.messageId.content
            },
            requestedBy:request.receiverId && {
                _id:request.receiverId._id,
                username:toUsername(request.receiverId)
            }
        }
    })
}

// 4. Accept Or Reject Request
export const respondToRequest=async(userId,requestId,status)=>{
    const request=await findById({
        model:IdentityRequestModel,
        id:requestId
    })
    if(!request || request.senderId.toString()!==userId.toString()){
        notFoundException("request not found")
    }
    if(request.status!==RequestStatusEnum.PENDING){
        conflictException("this request was already answered")
    }
    request.status=status
    await request.save()

    // 5. Create Conversation
    if(status===RequestStatusEnum.ACCEPTED){
        const conversation=await createOne({
            model:ConversationModel,
            data:{
                messageId:request.messageId,
                senderId:request.senderId,
                receiverId:request.receiverId
            }
        })
        return {request,conversation}
    }
    return {request}
}
