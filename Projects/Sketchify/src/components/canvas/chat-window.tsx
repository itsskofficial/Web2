"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Loader2, RefreshCw, Send, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addUserMessage, startStreamingResponse, appendStreamingContent, finishStreamingResponse, addErrorMessage, initializeChat } from '@/redux/slice/chat';
import { updateShape } from '@/redux/slice/shapes';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
    generatedUiId: string;
}

export const ChatWindow = ({ isOpen, onClose, generatedUiId }: ChatWindowProps) => {
    const dispatch = useAppDispatch();
    const [inputValue, setInputValue] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const chatState = useAppSelector(state => state.chat.chats[generatedUiId]);
    const currentShape = useAppSelector(state => state.shapes.shapes.entities[generatedUiId]);

    useEffect(() => {
        if (generatedUiId) {
            dispatch(initializeChat({ generatedUiId }));
        }
    }, [generatedUiId, dispatch]);

    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [chatState?.messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const message = inputValue.trim();
        if (!message || !chatState || chatState.isStreaming || !currentShape || currentShape.type !== 'generatedui') return;

        dispatch(addUserMessage({ generatedUiId, content: message }));
        setInputValue('');
        dispatch(startStreamingResponse({ generatedUiId }));

        try {
            const response = await fetch('/api/generate/redesign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentHTML: currentShape.uiSpecData,
                    userMessage: message,
                    projectId: "your_project_id_here", // TODO: Get project ID
                    wireframeSnapshot: "", // TODO: Pass original wireframe snapshot if available
                })
            });

            if (!response.ok || !response.body) {
                throw new Error("Failed to get response from server.");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedHtml = "";
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedHtml += chunk;

                // Update both the chat and the shape on the canvas
                dispatch(appendStreamingContent({ generatedUiId, contentChunk: chunk }));
                dispatch(updateShape({ id: generatedUiId, patch: { uiSpecData: accumulatedHtml } }));
            }

            dispatch(finishStreamingResponse({ generatedUiId }));

        } catch (error: any) {
            dispatch(addErrorMessage({ generatedUiId, content: error.message || "An error occurred." }));
        }
    };

    if (!isOpen || !chatState) return null;

    return (
        <div className="absolute bottom-20 right-4 w-96 h-[600px] bg-card border rounded-lg shadow-2xl flex flex-col z-50">
            <header className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold">Design Chat</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </header>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {chatState.messages.map(msg => (
                        <div key={msg.id} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                            <div className={cn(
                                "p-3 rounded-lg max-w-[80%]",
                                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                                msg.role === 'error' && 'bg-destructive text-destructive-foreground'
                            )}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <p className="text-xs text-right mt-1 opacity-60">
                                    {format(new Date(msg.createdAt), "h:mm a")}
                                </p>
                            </div>
                        </div>
                    ))}
                    {chatState.isStreaming && (
                        <div className="flex justify-start">
                             <div className="p-3 rounded-lg bg-muted">
                                <Loader2 className="h-5 w-5 animate-spin" />
                             </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <footer className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="e.g., 'Make the buttons blue...'"
                        disabled={chatState.isStreaming}
                    />
                    <Button type="submit" disabled={chatState.isStreaming}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </footer>
        </div>
    );
};