import { EventEmitter } from "node:events"
import { sendEmail } from "./send.email.js"
import { verifyEmailTemplate } from "./email.templates.js"

export const emailEvent=new EventEmitter()

emailEvent.on("sendEmail",async({recipients,subject,data})=>{
    try{
        await sendEmail({
            to:recipients.to,
            subject:subject.replaceAll("_"," "),
            html:verifyEmailTemplate({subject,...data})
        })
    }catch(error){
        console.log("Send Email Error",error)
    }
})
