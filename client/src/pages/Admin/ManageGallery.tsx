// client/src/pages/Admin/ManageGallery.tsx
import React, { useState, useCallback } from 'react';
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from 'react-dropzone';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { bhutaneseSymbols } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import Loader from "@/components/shared/Loader";
import { UploadCloud, Trash2, CheckCircle2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import type { UploadResponse as ImageKitUploadResponse } from 'imagekit/dist/libs/interfaces';

interface UploadResult extends ImageKitUploadResponse {
    localId: string;
}

interface BackendErrorResponse {
    message: string;
}

export default function ManageGallery() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [targetFolderName, setTargetFolderName] = useState<string>("gallery");
    const [sessionUploads, setSessionUploads] = useState<UploadResult[]>([]);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

    // --- Upload Mutation ---
    const uploadMutation = useMutation<ImageKitUploadResponse, Error, { file: File, localId: string }>({
        mutationFn: async ({ file, localId }) => {
            const formData = new FormData();
            formData.append('imageFile', file);
            formData.append('folderName', targetFolderName || 'gallery');

            setUploadErrors(prev => { const next = {...prev}; delete next[localId]; return next; });
            setUploadProgress(prev => ({ ...prev, [localId]: 0 }));

            const response = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            // Simulate progress (REMOVE FOR REAL PROGRESS)
            await new Promise(resolve => setTimeout(() => { setUploadProgress(prev => ({ ...prev, [localId]: 50 })); resolve(true); }, 300));
            await new Promise(resolve => setTimeout(() => { setUploadProgress(prev => ({ ...prev, [localId]: 90 })); resolve(true); }, 600));

            const responseBody = await response.json();

            if (!response.ok) {
                const errorMessage = (responseBody as BackendErrorResponse)?.message || `Upload failed: ${response.statusText}`;
                setUploadErrors(prev => ({ ...prev, [localId]: errorMessage }));
                throw new Error(errorMessage);
            }

            setUploadProgress(prev => ({ ...prev, [localId]: 100 }));
            return responseBody as ImageKitUploadResponse;
        },
        onSuccess: (data, variables) => {
            toast({ title: "Upload Successful", description: `${data.name} uploaded.` });
            setSessionUploads(prev => [...prev, { ...data, localId: variables.localId }]);
             setTimeout(() => {
                 setUploadProgress(prev => { const next = {...prev}; delete next[variables.localId]; return next; });
             }, 1500);
        },
        onError: (error, variables) => {
            const errorMsg = uploadErrors[variables.localId] || error.message || "An unknown error occurred.";
            toast({ title: "Upload Failed", description: errorMsg, variant: "destructive" });
        },
    });

    // --- Dropzone Logic ---
    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        if (!targetFolderName) {
            toast({ title: "Folder Required", description: "Please enter a target folder name.", variant: "destructive" });
            return;
        }

        if (fileRejections.length > 0) {
            fileRejections.forEach(({ file, errors }) => {
                errors.forEach((err: any) => {
                     toast({ title: `File Rejected: ${file.name}`, description: err.message, variant: "destructive" });
                });
            });
        }

        acceptedFiles.forEach(file => {
            const localId = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
            uploadMutation.mutate({ file, localId });
        });

    }, [uploadMutation, targetFolderName, toast]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp', '.jpg'] },
        multiple: true,
        maxSize: 5 * 1024 * 1024,
    });

    // --- Rendering ---
    return (
        <div className="min-h-screen bg-parchment">
            {/* Admin Header */}
             <div className="bg-monastic-red text-parchment p-4 shadow-md sticky top-0 z-40">
               {/* ... header content ... */}
               <div className="container mx-auto flex justify-between items-center">
                 <div className="flex items-center space-x-2">
                    <Link href="/admin/dashboard" className="flex items-center space-x-2 hover:text-faded-gold transition-colors">
                        <span className="text-2xl">
                        {bhutaneseSymbols.dharmaWheel}
                        </span>
                    </Link>
                 </div>
                 <span className="font-garamond">Manage Uploads / Gallery</span>
               </div>
             </div>

            {/* Content Area */}
            <div className="container mx-auto p-6 space-y-8">
                {/* Upload Section */}
                <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className='text-lg text-monastic-red flex items-center gap-2'>
                            <UploadCloud className="h-5 w-5"/> Upload New Images
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Folder Input */}
                         <div>
                            <Label htmlFor="folderName" className="font-garamond text-charcoal mb-1 block">Target Folder Name</Label>
                            {/* ... folder input ... */}
                            <div className='flex items-center'>
                                <span className='text-sm text-charcoal/70 mr-1'>/uploads/</span>
                                <Input
                                    id="folderName" type="text" value={targetFolderName}
                                    onChange={(e) => setTargetFolderName(e.target.value.trim().replace(/[^a-zA-Z0-9_-]/g, ''))} // Sanitize folder name
                                    placeholder="e.g., gallery, tours/specific_tour"
                                    className="parchment-input max-w-xs border-faded-gold" required
                                />
                            </div>
                            <p className="text-xs text-charcoal/60 mt-1">Use only letters, numbers, underscores, hyphens.</p>
                        </div>

                        {/* Dropzone Area */}
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-6 md:p-10 text-center cursor-pointer transition-colors duration-200 ease-in-out
                                ${isDragActive ? 'border-monastic-red bg-faded-gold/10' : 'border-faded-gold hover:border-monastic-red/70'}
                                ${isDragReject ? 'border-destructive bg-destructive/10' : ''}
                                ${uploadMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''} // <-- USE isPending HERE
                            `}
                        >
                            {/* --- FIX HERE --- */}
                            <input {...getInputProps()} disabled={uploadMutation.isPending} />
                            {/* --- END FIX --- */}
                            <UploadCloud className="mx-auto h-10 w-10 text-charcoal/70 mb-2" />
                            {isDragActive ? (
                                <p className="font-garamond text-monastic-red">Drop images here to upload...</p>
                            ) : (
                                <p className="font-garamond text-charcoal">Drag & drop images, or click to select files</p>
                            )}
                            <p className="text-xs text-charcoal/60 mt-1">(Max 5MB per file. Allowed: JPG, PNG, GIF, WEBP)</p>
                             {isDragReject && <p className="text-xs text-destructive mt-1">Some files will be rejected (invalid type or size).</p>}
                        </div>

                         {/* Upload Progress/Status Display */}
                         {/* ... progress/error display logic (no changes needed here) ... */}
                          {Object.keys(uploadProgress).length > 0 || Object.keys(uploadErrors).length > 0 ? (
                            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto p-2 border border-faded-gold/30 rounded bg-parchment/30">
                                <h4 className="font-semibold text-charcoal text-sm sticky top-0 bg-parchment/30 pb-1">Upload Status:</h4>
                                {Object.entries(uploadProgress).map(([localId, progress]) => (
                                    !uploadErrors[localId] && // Don't show progress if there's an error for this item
                                    <div key={localId} className="text-sm border-b border-faded-gold/20 pb-1 last:border-b-0">
                                        <Label className='block mb-1 text-xs truncate text-charcoal/80'>Uploading item ({localId.substring(0,15)})...</Label>
                                        <Progress value={progress} className="h-2" />
                                    </div>
                                ))}
                                 {Object.entries(uploadErrors).map(([localId, errorMsg]) => (
                                    <div key={localId} className="text-sm text-destructive flex items-start gap-1 border-b border-destructive/20 pb-1 last:border-b-0">
                                         <AlertCircle className='h-4 w-4 mt-0.5 flex-shrink-0'/>
                                         <span>Failed ({localId.substring(0,15)}...): {errorMsg}</span>
                                    </div>
                                ))}
                            </div>
                         ) : null}

                    </CardContent>
                </Card>

                {/* Display Successfully Uploaded Files (This Session) */}
                {/* ... session uploads display logic (no changes needed here) ... */}
                 {sessionUploads.length > 0 && (
                    <Card className="border-faded-gold bg-parchment/50 shadow-sm">
                       {/* ... Card Header ... */}
                       <CardHeader>
                             <CardTitle className='text-lg text-monastic-red flex items-center gap-2'>
                                <CheckCircle2 className="h-5 w-5 text-green-700"/> Uploaded This Session
                             </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className='space-y-3'>
                                {sessionUploads.map((file) => (
                                     <li key={file.fileId} className="flex items-center justify-between text-sm p-3 bg-parchment/50 rounded border border-faded-gold/50 gap-2">
                                        {/* ... display file details ... */}
                                        <div className='flex items-center space-x-3 overflow-hidden'>
                                            <img src={file.thumbnailUrl ?? file.url} alt={`Thumbnail for ${file.name}`} className="h-12 w-12 object-cover rounded flex-shrink-0 border border-faded-gold/30"/>
                                            <div className='flex flex-col overflow-hidden min-w-0'>
                                                <span className='font-semibold truncate text-charcoal text-base' title={file.name}>{file.name}</span>
                                                <a href={file.url} target="_blank" rel="noopener noreferrer" className='text-blue-600 hover:underline truncate text-xs' title={file.url}>View Full Image</a>
                                                <span className='text-xs text-charcoal/60 truncate' title={file.filePath}>Path: {file.filePath}</span>
                                                <Button size="sm" variant="ghost" className='text-xs h-auto p-1 mt-1 self-start' onClick={() => {navigator.clipboard.writeText(file.url); toast({title: "URL Copied!", duration: 1500})}}>Copy URL</Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                         <CardFooter>
                            <p className="text-xs text-charcoal/70">These images were uploaded in the current browser session.</p>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}