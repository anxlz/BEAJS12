import { EmailSubjectEnum } from "../enum/index.js"

// Shared Layout
const layout=({title,message,code})=>{
    return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:20px;background:#f2f2f2;font-family:Arial,sans-serif;">
    <div style="max-width:500px;margin:auto;background:#ffffff;border:1px solid #680c2a;">
        <div style="background:#680c2a;padding:24px;text-align:center;color:#ffffff;font-size:28px;">&#9993;</div>
        <div style="padding:24px;text-align:center;">
            <h2 style="color:#680c2a;margin:0 0 12px;">${title}</h2>
            <p style="color:#333333;">${message}</p>
            <div style="background:#680c2a;color:#ffffff;font-size:26px;letter-spacing:6px;padding:14px;margin:18px 0;">${code}</div>
            <p style="color:#888888;font-size:12px;">If you did not request this, you can ignore this email.</p>
        </div>
    </div>
</body>
</html>`
}

export const templates={
    [EmailSubjectEnum.CONFIRM_EMAIL]:(data)=>layout({
        title:"Confirm Email",
        message:"Use the code below to confirm your email address. It is valid for 2 minutes.",
        code:data.code
    }),
    [EmailSubjectEnum.TWO_STEP_VERIFICATION]:(data)=>layout({
        title:"Two Step Verification",
        message:"Use the code below to verify your identity. It is valid for 2 minutes.",
        code:data.code
    })
}

// Pick Template By Subject
export const verifyEmailTemplate=(data)=>{
    return templates[data.subject](data)
}
