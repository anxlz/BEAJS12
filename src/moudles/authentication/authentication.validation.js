import { z } from "zod"
import { generalValidationFields } from "../../common/validation.js"

const loginBody=z.strictObject({
    email:generalValidationFields.email,
    password:generalValidationFields.password
})

export const login=z.object({
    body:loginBody
})

export const signup=z.object({
    body:loginBody.safeExtend({
        username:generalValidationFields.username,
        phone:generalValidationFields.phone,
        confirmPassword:generalValidationFields.password
    }).superRefine((data,ctx)=>{
        if(data.password!==data.confirmPassword){
            ctx.addIssue({
                path:["confirmPassword"],
                message:"password and confirmPassword must match"
            })
        }
    })
})

export const loginWithGmail=z.object({
    body:z.strictObject({
        idToken:z.string().min(20)
    })
})

export const loginConfirmation=z.object({
    body:z.strictObject({
        email:generalValidationFields.email,
        otp:z.coerce.string().min(4).max(8)
    })
})

export const confirmTwoStepVerification=z.object({
    body:z.strictObject({
        otp:z.coerce.string().min(4).max(8)
    })
})

export const confirmEmail=z.object({
    body:z.strictObject({
        email:generalValidationFields.email,
        otp:z.coerce.string().min(4).max(8)
    })
})

export const resendConfirmEmail=z.object({
    body:z.strictObject({
        email:generalValidationFields.email
    })
})
