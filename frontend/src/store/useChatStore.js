import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./UseAuthStore";
import { io } from "socket.io-client";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);

      const currentMessages = get().messages;
      const filteredMessages = currentMessages.filter(msg => msg._id !== tempId);   
      set({ messages: [...filteredMessages, res.data] });
    } catch (error) {
      // remove optimistic message on failure
      const currentMessages = get().messages;
      const filteredMessages = currentMessages.filter(msg => msg._id !== tempId);
    set({ messages: filteredMessages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;
  
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;  // Add this line
    
    if (!socket || !socket.connected) {
      console.warn("Socket not connected");
      return;
    }
  
    // Remove existing listener first to avoid duplicates
    socket.off("newMessage");
  
    socket.on("newMessage", (newMessage) => {
      const currentSelectedUser = get().selectedUser;
      if (!currentSelectedUser || !authUser) return;
      
      // Convert ObjectIds to strings for comparison
      const messageSenderId = newMessage.senderId?.toString();
      const messageReceiverId = newMessage.receiverId?.toString();
      const selectedUserId = currentSelectedUser._id?.toString();
      const currentUserId = authUser._id?.toString();
      
      // Check if message is for the current conversation
      const isMessageForCurrentChat = 
        (messageSenderId === selectedUserId && messageReceiverId === currentUserId) ||
        (messageReceiverId === selectedUserId && messageSenderId === currentUserId);
      
      if (!isMessageForCurrentChat) return;
  
      const currentMessages = get().messages;
      // Check if message already exists (avoid duplicates)
      const messageExists = currentMessages.some(msg => msg._id?.toString() === newMessage._id?.toString());
      if (messageExists) return;
  
      set({ messages: [...currentMessages, newMessage] });
  
      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));