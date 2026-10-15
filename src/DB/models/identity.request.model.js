import mongoose from "mongoose";
import { RequestStatusEnum } from "../../common/enum/index.js";

const IdentityRequestSchema=new mongoose.Schema({
    messageId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message",
        required:true,
        unique:true
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    status:{
        type:Number,
        enum:Object.values(RequestStatusEnum),
        default:RequestStatusEnum.PENDING
    }
},{
    timestamps:true
})

export const IdentityRequestModel=mongoose.models.IdentityRequest || mongoose.model("IdentityRequest",IdentityRequestSchema)
