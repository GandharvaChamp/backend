const asycHandler = (requestHandler)=>{
    (req,req,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }
}


export {asycHandler}

/*const asynHandler=(fn)=>async (req,res,next)=>{

    try {
        await fn(req , res,next)
        
    } catch (error) {
        res.status(err.code || 500).json({
            sucess:false,
            message:err.message
        })
    }
}*/