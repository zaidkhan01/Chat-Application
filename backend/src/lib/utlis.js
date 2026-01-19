import jwt from 'jsonwebtoken';
import { ENV } from './env.js';
export const generateToken = async (userId, res) => {
      if(!ENV.JWT_SECRET){
        throw new Error("JWT_SECRET is not defined");
    }

  const token = jwt.sign({userId}, ENV.JWT_SECRET, {expiresIn:"7d"});

  res.cookie("jwt", token,{
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,//prevent xss attacks:cross site scripting attacks
    secure: ENV.NODE_ENV === "development"?false:true,//secure: true in production, false in development
    sameSite: "strict",//prevent csrf attacks:cross site request forgery attacks
});
return token;
}