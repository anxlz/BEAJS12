import { z } from "zod"
import { RequestStatusEnum } from "../../common/enum/index.js"

const objectId=z.string().length(24,"invalid id")

export const sendMessage=z.object({
    params:z.strictObject({
        receiverId:objectId
    }),
    body:z.strictObject({
        content:z.string().min(2).max(500)
    })
})

export const deleteMessage=z.object({
    params:z.strictObject({
        messageId:objectId
    })
})

export const requestSenderIdentity=z.object({
    params:z.strictObject({
        messageId:objectId
    })
})

export const respondToRequest=z.object({
    params:z.strictObject({
        requestId:objectId
    }),
    body:z.strictObject({
        status:z.union([
            z.literal(RequestStatusEnum.ACCEPTED),
            z.literal(RequestStatusEnum.REJECTED)
        ])
    })
})
