import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utlis.js';

export const signup = async (req,res) => {
   const {fullName, email, password}= req.body;
   
    try{
        if(!fullName || !email || !password){
            return res.status(400).json({message:"All fields are required"});

    }
    if(password.length < 8){
        return res.status(400).json({message:"Password must be at least 8 characters long"});
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // this is a regex to validate the email address
    if(!emailRegex.test(email)){
        return res.status(400).json({message:"Invalid email address"});
    }
    const user = await User.findOne({email});
    if(user){
        return res.status(400).json({message:"User already exists"});
        }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser=new User({
        fullName,
        email,
        password:hashedPassword,
    });
   if(newUser){
    generateToken(newUser._id,res);
    await newUser.save();
   res.status(201).json({
    _id:newUser._id,
    fullName:newUser.fullName,
    email:newUser.email,
    profilePic:newUser.profilePic,
   }
)
}else{
    res.status(400).json({message:"Invalid user data"});
}
}catch(error){
    console.log("error in signup controller", error);
    return res.status(500).json({message:"Internal server error", error:error.message});
}}


export const login = async (req,res) => {
    const {email, password}= req.body;
    try{
        if(!email || !password){
            return res.status(400).json({message:"All fields are required"});
        }

    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({message:"User not found"});
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect){
        return res.status(400).json({message:"Invalid password"});
    }
    generateToken(user._id,res);
    res.status(200).json({
        _id:user._id,
        fullName:user.fullName,
        email:user.email,
        profilePic:user.profilePic,
    });
}catch(error){
    console.log("error in login controller", error);
    return res.status(500).json({message:"Internal server error", error:error.message});
}}


export const logout = async (req,res) => {
    res.cookie("jwt", "", {maxAge:0});
    res.status(200).json({message:"Logged out successfully"});
}