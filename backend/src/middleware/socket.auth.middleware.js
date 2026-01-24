import jwt from "jsonwebtoken";
import {ENV} from "../lib/env.js";
import User from "../models/User.js";

export const socketAuthMiddleware = async (socket, next) => {
    try{
        const token = socket.handshake.headers.cookie?.split(";").find(row=>row.startsWith("jwt="))?.split("=")[1];
        if(!token){
            return next(new Error("Unauthorized no token provided"));
        }
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded){
            return next(new Error("Unauthorized invalid token"));
        }
        const user = await User.findById(decoded.userId).select("-password");
    if(!user){
        return next(new Error("Unauthorized user not found"));
    }

    //attach user and userId to the socket object
    socket.user = user;
    socket.userId = user._id.toString();
    console.log("user connected", user.fullName);
    console.log("user id", user._id.toString());
    console.log("user socket id", socket.id);
    next(); 
}catch(error){
    console.log("error in socketAuthMiddleware", error);
    next(new Error("Unauthorized"));
}
}