// Rate Limit Store (shared between PM2 instances, backed by Redis)
export class RedisRateLimitStore{

    // Cache functions are injected
    constructor({incrBy,decrBy,expire,ttl,del}){
        this.incrBy=incrBy
        this.decrBy=decrBy
        this.expire=expire
        this.ttl=ttl
        this.del=del
        this.windowSeconds=60
        // Keys Live In Redis
        this.localKeys=false
    }

    // Called By express-rate-limit
    init(options){
        this.windowSeconds=Math.ceil(options.windowMs/1000)
    }

    async increment(key){
        const totalHits=await this.incrBy({key})
        let remaining=await this.ttl({key})
        // First Hit Or Missing Ttl
        if(totalHits===1 || remaining<0){
            await this.expire({key,ttl:this.windowSeconds})
            remaining=this.windowSeconds
        }
        return {
            totalHits,
            resetTime:new Date(Date.now()+remaining*1000)
        }
    }

    async decrement(key){
        await this.decrBy({key})
    }

    async resetKey(key){
        await this.del({key})
    }
}
