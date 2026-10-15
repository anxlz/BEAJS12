import { ipKeyGenerator, rateLimit } from "express-rate-limit"
import geoip from "geoip-lite"
import { RATE_LIMIT_ALLOWED_COUNTRIES } from "../../config.js"
import { decrBy, del, expire, incrBy, ttl } from "../services/index.js"
import { sucessresponse } from "./success.response.js"
import { RedisRateLimitStore } from "./limiter.store.js"

// Detect Ip Location
export const fromWhere=(ip="")=>{
    return geoip.lookup(ip.replace("::ffff:",""))
}

// ttl is in minutes
export const generateRateLimiter=({
    limit=5,
    ttl:windowMinutes=1,
    statusCode=429,
    message="Too many requests, please try again later",
    legacyHeaders=false,
    standardHeaders="draft-7",
    skipSuccessfulRequests=false,
    skipFailedRequests=false
}={})=>{
    return rateLimit({
        windowMs:windowMinutes*60*1000,
        legacyHeaders,
        standardHeaders,
        skipSuccessfulRequests,
        skipFailedRequests,

        handler:(req,res,next)=>{
            return sucessresponse({res,status:statusCode,message})
        },

        // Block Countries Not Allowed
        limit:async(req)=>{
            const country=fromWhere(req.ip)
            if(!country){
                return limit
            }
            return RATE_LIMIT_ALLOWED_COUNTRIES.includes(country.country) ? limit : 0
        },

        // One Counter Per Ip And Route
        keyGenerator:(req)=>{
            return `RateLimit::${ipKeyGenerator(req.ip)}::${req.baseUrl}${req.path}`
        },

        store:new RedisRateLimitStore({incrBy,decrBy,expire,ttl,del})
    })
}
