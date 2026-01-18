import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import authRoute from './route/auth.route.js';
import messageRoute from './route/message.route.js';
dotenv.config();

const app = express();
  const __dirname =path.resolve();
const PORT = process.env.PORT || 3000;
console.log(PORT);

app.use("/api/auth",authRoute);
app.use("api/message",messageRoute);
// for production build we are using the dist folder
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get("*", (_,res)=> res.sendFile(path.join(__dirname,"../frontend/dist/index.html")));
}
app.listen(3000,()=> console.log("server running at port 3000"));

