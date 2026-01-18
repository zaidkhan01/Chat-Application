import mongoose from 'mongoose';

const userSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        minlength:8,
    },
    fullName:{
        type:String,
        required:true,
    },
    profilePic:{
        type:String,
        default:"",
    }
}, {timestamps:true});// timestamps:true will add createdAt and updatedAt fields to the schema  

const User = mongoose.model('User', userSchema);
export default User;