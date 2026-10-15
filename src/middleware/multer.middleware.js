import { badRequestException } from "../common/execption/index.js"
import { processMulterUpload } from "../common/utlis/index.js"

// Run Multer, Then Process And Move The File(s)
export const uploadMiddleware=({isRequired=true,multerMiddleware,customPath="general",validation=[]})=>{
    return (req,res,next)=>{

        multerMiddleware(req,res,async(error)=>{
            if(error){
                next(new Error(error.message,{cause:{status:400}}))
                return
            }

            try{
                if(
                    isRequired
                    && (
                        !req.file &&
                        !(Array.isArray(req.files) && req.files.length) &&
                        !(typeof req.files=="object" && Object.keys(req.files)?.length)
                    )
                ){
                    next(badRequestException("file is required"))
                    return
                }

                if(req.file || req.files){
                    await processMulterUpload({req,customPath,validation})
                }

                next()
            }catch(error){
                next(error)
            }
        })

    }
}
