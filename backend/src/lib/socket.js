import {Server} from "socket.io";
import http from "http";
import express from "express";
import {ENV} from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";


const app = express();
const server = http.createServer(app);  
const io = new Server(server,{
    cors:{
        origin:ENV.CLIENT_URL,
        methods:["GET","POST"],
        credentials:true,
    },
});
io.use(socketAuthMiddleware);

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}


// for storing online users
const userSocketMap = {};
io.on("connection", (socket) => {
    console.log("a user connected", socket.user.fullName);

    const userId=socket.userId?.toString();
    userSocketMap[userId]=socket.id;

    //io.emit is used to send a message to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

 // with socket.on we listen to events from the client side
    socket.on("disconnect", () => {
        console.log("a user disconnected", socket.user.fullName);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    });
}); 
export {io, app, server};