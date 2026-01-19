import mongoose from 'mongoose';
import { ENV } from './env.js'; // this is a way to import the environment variables from the env.js file   
export const connectDB= async () => {
    try{
        if(!ENV.MONGO_URI){
            throw new Error("MONGO_URI is not defined");
        }
        const conn = await mongoose.connect(ENV.MONGO_URI);
        console.log(`Connected to MongoDB: ${conn.connection.host}`);
    }catch(error){
        console.log("Error connection to mongooseDB", error);
        process.exit(1);// 1 status code emans fail, 0 means success
    }
}