export const asyncHandler=(fun) => async (req,res,next) =>{
try{
    await fun(req,res,next)}
    catch(err){next(err)}

};

export default asyncHandler