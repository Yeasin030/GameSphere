import { create } from 'zustand';
import api from '../lib/axios';

interface MessengerState {
    conversations: any[];
    activeConversation: any | null;
    messages: any[];
    isLoading: boolean;
    fetchConversations: () => Promise<void>;
    setActiveConversation: (id: number) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
}

export const useMessengerStore = create<MessengerState>((set, get) => ({
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    fetchConversations: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/conversations');
            set({ conversations: response.data.data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    },
    setActiveConversation: async (id) => {
        set({ isLoading: true });
        try {
            const [convRes, msgRes] = await Promise.all([
                api.get(`/conversations/${id}`),
                api.get(`/conversations/${id}/messages`)
            ]);
            set({ 
                activeConversation: convRes.data.data, 
                messages: msgRes.data.data,
                isLoading: false 
            });
        } catch (error) {
            set({ isLoading: false });
        }
    },
    sendMessage: async (content) => {
        const { activeConversation, messages } = get();
        if (!activeConversation) return;
        
        try {
            const response = await api.post(`/conversations/${activeConversation.id}/messages`, { content });
            set({ messages: [...messages, response.data.data] });
        } catch (error) {
            console.error('Failed to send message', error);
        }
    }
}));
