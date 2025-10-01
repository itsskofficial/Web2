import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'error';
    content: string;
    createdAt: string;
}

export interface GeneratedUIChatState {
    generatedUiId: string;
    messages: ChatMessage[];
    isStreaming: boolean;
    streamingMessageId: string | null;
}

interface ChatState {
    chats: Record<string, GeneratedUIChatState>; // Keyed by generatedUiId
}

const initialState: ChatState = {
    chats: {},
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        initializeChat(state, action: PayloadAction<{ generatedUiId: string }>) {
            const { generatedUiId } = action.payload;
            if (!state.chats[generatedUiId]) {
                state.chats[generatedUiId] = {
                    generatedUiId,
                    messages: [],
                    isStreaming: false,
                    streamingMessageId: null,
                };
            }
        },
        addUserMessage(state, action: PayloadAction<{ generatedUiId: string; content: string }>) {
            const { generatedUiId, content } = action.payload;
            const chat = state.chats[generatedUiId];
            if (chat) {
                chat.messages.push({
                    id: nanoid(),
                    role: 'user',
                    content,
                    createdAt: new Date().toISOString(),
                });
            }
        },
        startStreamingResponse(state, action: PayloadAction<{ generatedUiId: string }>) {
            const { generatedUiId } = action.payload;
            const chat = state.chats[generatedUiId];
            if (chat) {
                const streamingMessageId = nanoid();
                chat.isStreaming = true;
                chat.streamingMessageId = streamingMessageId;
                chat.messages.push({
                    id: streamingMessageId,
                    role: 'assistant',
                    content: '', // Start with empty content
                    createdAt: new Date().toISOString(),
                });
            }
        },
        appendStreamingContent(state, action: PayloadAction<{ generatedUiId: string; contentChunk: string }>) {
            const { generatedUiId, contentChunk } = action.payload;
            const chat = state.chats[generatedUiId];
            if (chat && chat.isStreaming && chat.streamingMessageId) {
                const message = chat.messages.find(m => m.id === chat.streamingMessageId);
                if (message) {
                    message.content += contentChunk;
                }
            }
        },
        finishStreamingResponse(state, action: PayloadAction<{ generatedUiId: string }>) {
            const { generatedUiId } = action.payload;
            const chat = state.chats[generatedUiId];
            if (chat) {
                chat.isStreaming = false;
                chat.streamingMessageId = null;
            }
        },
        addErrorMessage(state, action: PayloadAction<{ generatedUiId: string; content: string }>) {
            const { generatedUiId, content } = action.payload;
            const chat = state.chats[generatedUiId];
            if (chat) {
                chat.messages.push({
                    id: nanoid(),
                    role: 'error',
                    content,
                    createdAt: new Date().toISOString(),
                });
                chat.isStreaming = false;
                chat.streamingMessageId = null;
            }
        },
    },
});

export const {
    initializeChat,
    addUserMessage,
    startStreamingResponse,
    appendStreamingContent,
    finishStreamingResponse,
    addErrorMessage,
} = chatSlice.actions;

export default chatSlice.reducer;