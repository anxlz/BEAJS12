
import { conflictException, forbiddenException, notFoundException, tooManyRequestException, unauthorizedException } from "../../common/execption/index.js"
import { createOne, findOne } from "../../common/repository/index.js"
import { decryption, encryption } from "../../common/security/encryption.security.js"
import { compare, createLoginCredentials, hash, sendEmailOtp, verifyEmailOtp, verifyGoogleToken } from "../../common/security/index.js"
import { del, expire, incrBy, ttl } from "../../common/services/index.js"
import { EmailSubjectEnum, ProviderEnum } from "../../common/enum/index.js"
import { UserModel } from "../../DB/models/index.js"

const MAX_LOGIN_TRIALS=5
const LOGIN_BLOCK_SECONDS=5*60

// Login Ban Key
const userLoginTrailsKey=({email})=>{
    return `User::${email}::Login::Trials`
}

export const signup=async({email,password,username,phone})=>{
    const duplicateEmail=await findOne({
        model:UserModel,
        filter:{email},
        options:{
            select:"email"
        }
    })
    if(duplicateEmail){
        conflictException("email is already exists")
    }
    const user=await createOne({
        model:UserModel,
        
        data:{
            email,
            password:await hash(password),
            username,
            phone:await encryption(phone)
        }
    })
    await sendEmailOtp({email,subject:EmailSubjectEnum.CONFIRM_EMAIL})
    return user
}

// Confirm Email
export const confirmEmail=async({email,otp})=>{
    const account=await findOne({
        model:UserModel,
        filter:{email,provider:ProviderEnum.SYSTEM,confirmEmail:null}
    })
    if(!account){
        notFoundException("Invalid account")
    }
    await verifyEmailOtp({email,subject:EmailSubjectEnum.CONFIRM_EMAIL,otp})
    account.confirmEmail=new Date()
    await account.save()
    return true
}

// Resend Confirm Email Otp
export const resendConfirmEmail=async({email})=>{
    const account=await findOne({
        model:UserModel,
        filter:{email,provider:ProviderEnum.SYSTEM,confirmEmail:null}
    })
    if(!account){
        notFoundException("Invalid account")
    }
    await sendEmailOtp({email,subject:EmailSubjectEnum.CONFIRM_EMAIL})
    return true
}

export const login=async({email,password},issuer)=>{
    const account=await findOne({
        model:UserModel,
        filter:{email},
        options:{
            select:"+password"
        },
    })
    if(!account){
        notFoundException("this email is not found ")
    }
    if(account.provider!==ProviderEnum.SYSTEM){
        unauthorizedException("this email is registered with google, please login with google")
    }

    if(!account.confirmEmail){
        forbiddenException("please confirm your email first")
    }

    // Account Ban Check
    const blockTTL=await ttl({key:userLoginTrailsKey({email})})
    if(blockTTL>0){
        tooManyRequestException(`account temporarily banned due to multiple failed login attempts, try again after ${blockTTL}s`)
    }

    const match =await compare(password,account.password)
    if(!match){
        const trials=await incrBy({key:userLoginTrailsKey({email})})
        if(trials>=MAX_LOGIN_TRIALS){
            await expire({key:userLoginTrailsKey({email}),ttl:LOGIN_BLOCK_SECONDS})
        }
        unauthorizedException("invalid login")
    }

    // Reset Trials On Success
    await del({key:userLoginTrailsKey({email})})

    // Two Step Verification
    if(account.twoStepVerification){
        await sendEmailOtp({email,subject:EmailSubjectEnum.TWO_STEP_VERIFICATION})
        return {twoStepVerification:true,message:"a verification code was sent to your email"}
    }

    return createLoginCredentials({user:account,issuer})
}

// Confirm Login With Otp
export const loginConfirmation=async({email,otp},issuer)=>{
    const account=await findOne({
        model:UserModel,
        filter:{email}
    })
    if(!account){
        notFoundException("this email is not found")
    }
    await verifyEmailOtp({email,subject:EmailSubjectEnum.TWO_STEP_VERIFICATION,otp})
    return createLoginCredentials({user:account,issuer})
}

// Enable Two Step Verification
export const enableTwoStepVerification=async(user)=>{
    await sendEmailOtp({email:user.email,subject:EmailSubjectEnum.TWO_STEP_VERIFICATION})
    return true
}

// Confirm Enabling Two Step Verification
export const confirmTwoStepVerification=async(user,{otp})=>{
    await verifyEmailOtp({email:user.email,subject:EmailSubjectEnum.TWO_STEP_VERIFICATION,otp})
    user.twoStepVerification=true
    await user.save()
    return user
}


// Login/Signup With Google
export const loginWithGmail=async({idToken},issuer)=>{
    const payload=await verifyGoogleToken(idToken)
    let account=await findOne({
        model:UserModel,
        filter:{
            email:payload.email
        }
    })
    if(!account){
        account=await createOne({
            model:UserModel,
            data:{
                email:payload.email,
                username:payload.name || payload.email,
                provider:ProviderEnum.GOOGLE,
                confirmEmail:new Date(),
                image:payload.picture
            }
        })
    }
    return createLoginCredentials({user:account,issuer})
}


export const getprofileByID=async(id)=>{
    const user=await findOne({
        model:UserModel,
        filter:{
            _id:id
        }
    })
    if(!user){
        notFoundException("not found")
    }
    if(user.phone){
        user.phone=await decryption(user.phone)
    }
    return user
}
