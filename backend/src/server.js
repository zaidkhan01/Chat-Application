import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoute from './route/auth.route.js';
import messageRoute from './route/message.route.js';
import { connectDB } from './lib/db.js';
import cors from 'cors';
dotenv.config();

const app = express();
  const __dirname =path.resolve();
const PORT = process.env.PORT || 3000;
console.log(PORT);
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json()); // this ia middleware to parse the body of the request

app.use("/api/auth",authRoute);
app.use("/api/messages",messageRoute);
// for production build we are using the dist folder
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*", (_,res)=> res.sendFile(path.join(__dirname,"../frontend/dist/index.html")));
}
app.listen(PORT,()=> {
    console.log("server running at port 3000")
    connectDB();
});

