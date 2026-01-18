import dotenv from 'dotenv';
import express from 'express';
import authRoute from './route/auth.route.js';
import messageRoute from './route/message.route.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
console.log(PORT);

app.use("/api/auth",authRoute);
app.use("api/message",messageRoute);

app.listen(3000,()=> console.log("server running at port 3000"));

