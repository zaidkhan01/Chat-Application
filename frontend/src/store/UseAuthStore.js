import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
export const useAuthStore = create((set,get) => ({
   authUser:null,
   isCheckingAuth:true,
   isSigningUp:false,
   isLoggingIn:false,
   isLoggingOut:false,
   socket:null,
   onlineUsers:[],
   checkAuth:async () => {
    try{
        const response = await axiosInstance.get("/auth/check");
        set({authUser:response.data});
    }catch(error){
        console.error("Error checking auth", error);
        set({authUser:null});
       
    }finally{
        set({isCheckingAuth:false});
    }
   },
  
   signup: async (data) => {
    console.log("signup function called with data:", data);
    // validate data before processing
    if(!data || !data.fullName || !data.email || !data.password){
        console.error("Invalid signup data:", data);
        toast.error("Please fill in all fields");
        return;
    }


    set({ isSigningUp: true });
    console.log("Signup data:", data);
    console.log("Axios baseURL:", axiosInstance.defaults.baseURL);
    try {
      console.log("making POST request to /auth/signup...")
      const res = await axiosInstance.post("/auth/signup", data);
      console.log("signup response received", res);
      set({ authUser: res.data });

      toast.success("Account created successfully!");
      get().connectSocket();
    } catch (error) {
      console.error("signup error:", error);
      toast.error(error.response?.data?.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

   login:async (data) => {
    set({ isLoggingIn: true });
    try{
        const response = await axiosInstance.post("/auth/login", data);
        set({authUser:response.data});
        toast.success("Login successful");
        get().connectSocket();
    }catch(error){
        toast.error(error.response.data.message);
        
    }finally{
        set({ isLoggingIn: false });
    }
   },
 
    logout:async () => {
        set({ isLoggingOut: true });
        try{
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        }catch(error){
            toast.error(error.response.data.message);
        }finally{
            set({ isLoggingOut: false });
        }
    },
    updateProfile:async (data) => {
        set({ isUpdatingProfile: true });
        try{
            const response = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: response.data });
            toast.success("Profile updated successfully");
        }catch(error){
            toast.error(error.response.data.message);
        }finally{
            set({ isUpdatingProfile: false });
        }
    },
    connectSocket:() => {
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL,{
            withCredentials:true,
        });
        socket.connect();
        set({socket});
        //listen to events of online user from client
        socket.on("getOnlineUsers",(userIds) => {
            set({onlineUsers:userIds});
        });
    },
    disconnectSocket:() => {
       if(get().socket?.connected){
        get().socket.disconnect();
        
       }
    },
}));