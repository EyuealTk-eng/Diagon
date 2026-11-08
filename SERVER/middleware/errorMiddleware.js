import {env} from '../utils/env.js';

export const errorHandler=(err,req,res,next)=>{
    const statusCode=err.statusCode||500;
    const status=err.status||'error';

    if(env.nodeENV !=='production'){
        console.error('[ERRORRR BY GLOBALL handler]:',err);
    }
    res.status(statusCode).json({status,message:err.message||'Internal Server Error',
        ...(env.nodeENV !== 'production' && { stack: err.stack}),})


}
export default errorHandler;