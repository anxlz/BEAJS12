import { conflictException, tooManyRequestException } from "../execption/index.js"
import { del, expire, get, incrBy, set, ttl } from "../services/index.js"
import { emailEvent, createOtp } from "../utlis/index.js"
import { compare, hash } from "./hash.security.js"

// Base Key
export const userEmailKey=({email,subject})=>{
    return `User::${email}::${subject}::OTP`
}

// Trials Key
export const userEmailTrailsKey=({email,subject})=>{
    return `${userEmailKey({email,subject})}::Trails`
}

// Send Email Otp
// expiresIn: how long the OTP itself stays valid (seconds)
// maxTrials: how many times a new OTP can be requested before being blocked
// blockInSeconds: how long the block lasts once maxTrials is reached
export const sendEmailOtp=async({email,subject,expiresIn=120,maxTrials=3,blockInSeconds=3600})=>{

    const existOTP_TTl=await ttl({key:userEmailKey({email,subject})})
    if(existOTP_TTl>0){
        tooManyRequestException(`Sorry we cannot create new otp while existing one still valid please try again later after ${existOTP_TTl}s`)
    }

    const oldTrials=await get({key:userEmailTrailsKey({email,subject})}) ?? 0
    if(oldTrials>=maxTrials){
        tooManyRequestException("Max otp trials has been reached, please try again later")
    }

    const code=createOtp()
    await set({
        key:userEmailKey({email,subject}),
        value:await hash(code.toString()),
        expiresIn
    })

    await incrBy({key:userEmailTrailsKey({email,subject})})
    await expire({key:userEmailTrailsKey({email,subject}),ttl:blockInSeconds})

    emailEvent.emit("sendEmail",{recipients:{to:email},subject,data:{code}})
    return true
}

// Verify Email Otp
export const verifyEmailOtp=async({email,subject,otp})=>{
    const hashOtp=await get({key:userEmailKey({email,subject})})
    if(!hashOtp || !await compare(otp.toString(),hashOtp)){
        conflictException("Invalid or expired OTP")
    }
    await del({key:userEmailKey({email,subject})})
    await del({key:userEmailTrailsKey({email,subject})})
    return true
}
