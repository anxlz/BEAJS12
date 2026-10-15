import { z } from "zod"

const objectId=z.string().length(24,"invalid id")

export const sendConversationMessage=z.object({
    params:z.strictObject({
        conversationId:objectId
    }),
    body:z.strictObject({
        content:z.string().min(1).max(1000)
    })
})

export const getConversationMessages=z.object({
    params:z.strictObject({
        conversationId:objectId
    })
})
