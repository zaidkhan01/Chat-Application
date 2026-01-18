import mongoose from 'mongoose';

export const connectDB= async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB", conn.connection.host);
    }catch(error){
        console.log("Error connection to mongooseDB", error);
        process.exit(1);// 1 status code emans fail, 0 means success
    }
}