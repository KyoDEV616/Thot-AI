import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type Theme = "pyramid" | "ocean" | "forest";

interface AppState {
  // Backend
  backendPort: number;
  setBackendPort: (port: number) => void;

  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversation: (id: string) => void;
  createConversation: () => string;
  addMessage: (conversationId: string, message: Message) => void;
  updateLastMessage: (conversationId: string, content: string) => void;
  updateConversationTitle: (id: string, title: string) => void;

  // UI
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
  modelManagerOpen: boolean;
  setModelManagerOpen: (v: boolean) => void;

  // Model
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: string[];
  setAvailableModels: (models: string[]) => void;

  // Settings
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  ollamaStatus: "online" | "offline" | "checking";
  setOllamaStatus: (status: "online" | "offline" | "checking") => void;

  // Streaming
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      backendPort: 8000,
      setBackendPort: (port) => set({ backendPort: port }),

      conversations: [],
      activeConversationId: null,
      setActiveConversation: (id) => set({ activeConversationId: id }),
      createConversation: () => {
        const id = crypto.randomUUID();
        const conv: Conversation = {
          id,
          title: "Nueva conversación",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          conversations: [conv, ...state.conversations],
          activeConversationId: id,
        }));
        return id;
      },
      addMessage: (conversationId, message) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
              : c
          ),
        })),
      updateLastMessage: (conversationId, content) =>
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const msgs = [...c.messages];
            if (msgs.length > 0) {
              msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
            }
            return { ...c, messages: msgs };
          }),
        })),
      updateConversationTitle: (id, title) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title } : c
          ),
        })),

      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      theme: "pyramid",
      setTheme: (theme) => set({ theme }),
      darkMode: true,
      setDarkMode: (v) => set({ darkMode: v }),
      settingsOpen: false,
      setSettingsOpen: (v) => set({ settingsOpen: v }),
      modelManagerOpen: false,
      setModelManagerOpen: (v) => set({ modelManagerOpen: v }),

      selectedModel: "",
      setSelectedModel: (model) => set({ selectedModel: model }),
      availableModels: [],
      setAvailableModels: (models) => set({ availableModels: models }),

      systemPrompt:
        "Eres Thot, un asistente de IA sabio e inspirado en el dios egipcio del conocimiento. Eres preciso, reflexivo y erudito, pero también accesible y amigable.",
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      ollamaStatus: "checking",
      setOllamaStatus: (status) => set({ ollamaStatus: status }),

      isStreaming: false,
      setIsStreaming: (v) => set({ isStreaming: v }),
    }),
    {
      name: "thot-ai-store",
      partialize: (state) => ({
        conversations: state.conversations,
        theme: state.theme,
        darkMode: state.darkMode,
        selectedModel: state.selectedModel,
        systemPrompt: state.systemPrompt,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
