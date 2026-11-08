import dotenv from 'dotenv';

dotenv.config();
export const env={
    //server and cors related vars
    port:Number(process.env.PORT)||5001,
    clientURL:process.env.CLIENT_URL||'http://localhost:5173',
    nodeENV: process.env.NODE_ENV||'development',
   //DATABSE RELATED vars
    dbHOST:process.env.DB_HOST||'localhost',
    dbPORT:Number(process.env.DB_PORT)||5432,
    dbUSER:process.env.DB_USER||'postgres',
    dbPASS:process.env.DB_PASSWORD||'123',
    dbNAME:process.env.DB_NAME||'postgres',
 //JWTTTT
    AccessTokenKey:process.env.ACCESS_TOKEN_SECRET,
    RefreshTokenKey:process.env.REFRESH_TOKEN_SECRET,
}
export default env;