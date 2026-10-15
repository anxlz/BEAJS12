import multer from "multer"
import { resolve } from "node:path"
import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { fileTypeFromBuffer } from "file-type"
import { badRequestException } from "../../execption/index.js"

export const fileValidation={
    image:["image/jpeg","image/png","image/gif"],
    files:["application/pdf","application/json"]
}

// Multer Instance
export const localFileUpload=({maxFileSize=5}={})=>{
    const storage=multer.memoryStorage()
    return multer({storage,limits:{fileSize:maxFileSize*1024*1024}})
}

// Process One File
export const processFile=async({customPath="general",file,validation=[]})=>{
    const result=await fileTypeFromBuffer(file.buffer)
    if(!result || !validation.includes(result.mime)){
        badRequestException("Invalid file formats")
    }
    await mkdir(resolve(`./assets/${customPath}`),{recursive:true})
    const uniqueFilePath=`assets/${customPath}/${randomUUID()}.${result.ext}`
    await writeFile(resolve(`./${uniqueFilePath}`),file.buffer)
    file.finalPath=uniqueFilePath
    return file
}

// Process Several Files (array upload)
export const processFiles=async({customPath="general",files=[],validation=[]})=>{
    const assets=[]
    for(const file of files){
        const uploadFile=await processFile({customPath,file,validation})
        assets.push(uploadFile)
    }
    return assets
}

// Process Named Fields (.fields() upload)
export const processFields=async({customPath="general",fields={},validation=[]})=>{
    const assets={}
    for(const key of Object.keys(fields)){
        assets[key]=await processFiles({customPath,files:fields[key],validation})
    }
    return assets
}

// Entry Point - Called After Multer Has Parsed The Request
export const processMulterUpload=async({req,customPath="general",validation=[]})=>{
    if(req.file){
        await processFile({customPath,file:req.file,validation})
    }else if(Array.isArray(req.files)){
        await processFiles({customPath,files:req.files,validation})
    }else if(typeof req.files=="object" && Object.keys(req.files)?.length){
        await processFields({customPath,fields:req.files,validation})
    }
}
