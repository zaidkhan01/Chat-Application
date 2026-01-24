import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
export const useAuthStore = create((set,get) => ({
   authUser:null,
   isCheckingAuth:true,
   isSigningUp:false,

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
    //   get().connectSocket();
    } catch (error) {
      console.error("signup error:", error);
      toast.error(error.response?.data?.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

   login:async (data) => {
    try{
        const response = await axiosInstance.post("/auth/login", data);
        set({authUser:response.data});
        toast.success("Login successful");
    }catch(error){
        toast.error(error.response.data.message);
        console.error("Error logging in", error);
        throw error;
    }
   },
}));