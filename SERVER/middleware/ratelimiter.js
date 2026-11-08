import ratelimit from 'express-rate-limit';

export const limitAuth= ratelimit({
    windowMs:15*60*1000,
    max:10,
    standardHeaders:true,
    legacyHeaders:false,
    validate: {trustProxy:false},
    message:{
        status:'fail',
        message:'Trying so hard HotRod, Slowdown.',
    }
});

export default limitAuth;