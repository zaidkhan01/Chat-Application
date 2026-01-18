import jwt from 'jsonwebtoken';

export const generateToken = async (userId, res) => {

  const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn:"7d"});

  res.cookie("jwt", token,{
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,//prevent xss attacks:cross site scripting attacks
    secure: process.env.NODE_ENV === "development"?false:true,//secure: true in production, false in development
    sameSite: "strict",//prevent csrf attacks:cross site request forgery attacks
});
return token;
}