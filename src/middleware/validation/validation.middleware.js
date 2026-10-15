import { badRequestException } from "../../common/execption/index.js"

// Validate Request
export const validation=(schema)=>{
    return (req,res,next)=>{
        const data={
            body:req.body ?? {},
            params:req.params,
            query:req.query
        }
        const result=schema.safeParse(data)
        if(!result.success){
            const issues=result.error.issues.map((issue)=>{
                return {
                    path:issue.path.join("."),
                    message:issue.message
                }
            })
            badRequestException("validation error",issues)
        }
        if(result.data.body!==undefined){
            req.body=result.data.body
        }
        if(result.data.params!==undefined){
            req.params=result.data.params
        }
        if(result.data.query!==undefined){
            // Express 5 query is read-only
            Object.defineProperty(req,"query",{value:result.data.query,writable:true,configurable:true,enumerable:true})
        }
        next()
    }
}
