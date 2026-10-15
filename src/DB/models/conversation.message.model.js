import mongoose from "mongoose";

const ConversationMessageSchema=new mongoose.Schema({
    conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation",
        required:true
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    content:{
        type:String,
        required:true,
        minLength:1,
        maxLength:1000
    }
},{
    timestamps:true
})

export const ConversationMessageModel=mongoose.models.ConversationMessage || mongoose.model("ConversationMessage",ConversationMessageSchema)
