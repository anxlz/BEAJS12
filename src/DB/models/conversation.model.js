import mongoose from "mongoose";

const ConversationSchema=new mongoose.Schema({
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
    }
},{
    timestamps:true
})

export const ConversationModel=mongoose.models.Conversation || mongoose.model("Conversation",ConversationSchema)
