import Message from '../models/Message.js';
import User from '../models/User.js';

export const getAllContacts = async (req,res) => {
    try{
        const loggedInUserId =req.user._id;
        const filterUsers = await User.find({_id:{$ne:loggedInUserId}}).select("-password");
        res.status(200).json(filterUsers);
    }catch(error){
        console.log("error in getAllContacts controller", error);
        res.status(500).json({message:"Internal server error"});
    }
};


export const getMessagesByUserId = async (req,res) => {
    try{
        const myId =req.user._id;
        const {id: usertochatId}=req.params;

        const messages= await Message.find({
            $or:[
                {senderId:myId, receiverId:usertochatId},
                {senderId:usertochatId, receiverId:myId},
            ]
        });
        res.status(200).json(messages); 
    }catch(error){
        console.log("error in getMessagesByUserId controller", error);
        res.status(500).json({message:"Internal server error"});
    }
    }


export const sendMessage = async (req,res) => {
    try{
        const { text ,image}= req.body;
        const {id: receiverId}= req.params;
        const senderId= req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse =await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
        }

        const newMessage= new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    }catch(error){
        console.log("error in sendMessage controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}

export const getChatPartners = async (req,res) => {
    try{
        const loggedInUserId =req.user._id;

        const messages= await Message.find({
            $or:[{
                senderId:loggedInUserId},
                {receiverId:loggedInUserId},
            ],
        });

const chatPartnerIds=[
    ...new Set(
        messages.map(message=>
         message.senderId.toString() === loggedInUserId.toString() ? message.receiverId.toString() : message.senderId.toString()
        )
    ),
];  
const chatPartners= await User.find({_id:{$in:chatPartnerIds}});
res.status(200).json(chatPartners);
    }catch(error){
        console.log("error in getChatPartners controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}