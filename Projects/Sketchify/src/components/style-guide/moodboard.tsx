"use client";

import React, { useState, useRef } from 'react';
import { Doc } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '../ui/button';
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MoodboardProps {
    project: Doc<"projects">;
}

export const Moodboard = ({ project }: MoodboardProps) => {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveStorageId = useMutation(api.files.saveStorageId);
    const deleteFile = useMutation(api.files.deleteFile);

    const moodboardImages = project.moodboardImages || [];

    const handleFileSelect = async (files: FileList | null) => {
        if (!files) return;

        const imageFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
        if (imageFiles.length === 0) return;

        const uploadPromises = imageFiles.map(async (file) => {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();
            await saveStorageId({ storageId, projectId: project._id, type: "moodboard" });
        });

        toast.promise(Promise.all(uploadPromises), {
            loading: 'Uploading images...',
            success: 'Images uploaded successfully!',
            error: 'Failed to upload images.',
        });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files);
        }
    };
    
    const handleDelete = (storageId: string) => {
        toast.promise(deleteFile({ storageId, projectId: project._id, type: "moodboard" }), {
            loading: 'Deleting image...',
            success: 'Image deleted!',
            error: 'Failed to delete image.',
        });
    }

    return (
        <div className="p-4 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">Mood Board</h2>
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    dragActive ? "border-primary bg-accent" : "border-border hover:border-primary/50"
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                />
                <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                    Drag & drop images here, or click to select files.
                </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                {moodboardImages.map((image) => (
                    <div key={image.storageId} className="relative group">
                        <Image
                            src={image.url}
                            alt="Moodboard image"
                            width={200}
                            height={150}
                            className="rounded-md object-cover aspect-[4/3]"
                        />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(image.storageId);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};