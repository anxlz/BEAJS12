import nodemailer from "nodemailer"
import { EMAIL_PASSWORD, EMAIL_USER } from "../../config.js"

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:EMAIL_USER,
        pass:EMAIL_PASSWORD
    }
})

// Send Email
export const sendEmail=async({to,subject,html})=>{
    return await transporter.sendMail({
        from:EMAIL_USER,
        to,
        subject,
        html
    })
}
