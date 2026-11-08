class AppError extends Error{
    constructor(message,statusCode){
        super(message);

    this.statuscode=statusCode;

    this.satus=`${statusCode}`.startsWith('4')? 'fail':'error';
    this.isOperational=true;
    Error.captureStackTrace(this,this.constructor);}
 //400   
    static badRequest(message='Bad Request'){return new AppError(message,400);}
    //401
    static unauthorized(message='Unautorized'){ return new AppError(message,401);}
    //403 
    static Forbidden(message='Forbidden'){ return new AppError(message,403);}
//404
   static NotFound(message="Not Found"){return new AppError(message,404)}
   //409
   static Conflict(message="Conflict"){return new AppError(message,409);}
   //500
   static internal(message= 'Internale Server Error'){return new AppError(message,500);}

}
    
