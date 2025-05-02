// client/src/components/admin/ImageUploader.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Import UI components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Assuming you have a Label component or import from shadcn
import { Loader2, X, Upload, CheckCircle, AlertCircle } from "lucide-react";

// --- Component Props ---
interface ImageUploaderProps {
  folderName: string; // e.g., "tours", "profiles"
  initialImageUrl?: string | null; // URL of the existing image (if any)
  onUploadSuccess: (url: string) => void; // Callback with the new URL on success
  maxFileSize?: number; // Max file size in bytes
  acceptedImageTypes?: string[]; // Array of accepted MIME types
  label?: string; // Optional label for the uploader section
  buttonTextSelect?: string; // Text for select button (no image)
  buttonTextChange?: string; // Text for select button (image exists)
  className?: string; // Optional container class
}

// --- Default Values ---
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// --- Upload Status Type ---
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

// --- Image Upload Response Type (adjust based on your backend) ---
interface UploadResponse {
    url: string;
    filePath: string;
    fileId: string;
    name: string;
}

export function ImageUploader({
  folderName,
  initialImageUrl = null,
  onUploadSuccess,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedImageTypes = DEFAULT_ACCEPTED_IMAGE_TYPES,
  label = "Image",
  buttonTextSelect = "Select Image",
  buttonTextChange = "Change Image",
  className = "",
}: ImageUploaderProps) {
  const { toast } = useToast();

  // --- Internal State ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // State to hold the currently *displayed* image URL (initial or successfully uploaded)
  const [currentDisplayUrl, setCurrentDisplayUrl] = useState<string | null>(initialImageUrl);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync display URL if the initialImageUrl prop changes externally
  useEffect(() => {
    setCurrentDisplayUrl(initialImageUrl);
    // If the initial image changes, reset any pending upload state for clarity
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus('idle');
    setUploadError(null);
  }, [initialImageUrl]);

  // Effect for creating/revoking object URLs for local image preview
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Cleanup: revoke the object URL
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // --- Image Upload Mutation ---
  const imageUploadMutation = useMutation<UploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      setUploadStatus('uploading');
      setUploadError(null);
      const formData = new FormData();
      formData.append('imageFile', file);
      formData.append('folderName', folderName); // Use prop

      // Adjust API endpoint as needed
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include", // Include if auth is needed
      });

      if (!response.ok) {
        let errorMsg = `Upload failed (${response.status})`;
        try {
          const errBody = await response.json();
          errorMsg = errBody.message || JSON.stringify(errBody);
        } catch (e) { /* Ignore JSON parsing error */ }
        throw new Error(errorMsg);
      }
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentDisplayUrl(data.url); // Update displayed image
      onUploadSuccess(data.url);     // Notify parent component
      setUploadStatus('success');
      setSelectedFile(null);        // Clear selection state
      setPreviewUrl(null);          // Clear preview
      toast({ title: "Image Uploaded", description: `File ${data.name} ready.` });
    },
    onError: (error) => {
      setUploadStatus('error');
      setUploadError(error.message);
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
      // Optionally reset selected file on error? Depends on desired UX
      // setSelectedFile(null);
      // setPreviewUrl(null);
    },
  });

  // Handler for file input changes
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate
      if (file.size > maxFileSize) {
        toast({ title: "File Too Large", description: `Max size is ${maxFileSize / 1024 / 1024}MB.`, variant: "destructive" });
        return;
      }
      if (!acceptedImageTypes.includes(file.type)) {
        toast({ title: "Invalid File Type", description: `Please select one of: ${acceptedImageTypes.map(t => t.split('/')[1]).join(', ')}.`, variant: "destructive" });
        return;
      }

      // Update state for the newly selected file
      setSelectedFile(file);
      setUploadStatus('idle'); // Reset status to allow new upload attempt
      setUploadError(null);
    }
  };

  // Handler for triggering the upload mutation
  const handleUploadClick = () => {
    if (selectedFile) {
      imageUploadMutation.mutate(selectedFile);
    }
  };

  // Handler to clear selection/preview if user wants to cancel before uploading
  const handleCancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus('idle');
    setUploadError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the file input visually
    }
  }

  const isUploading = imageUploadMutation.isPending;
  // Determine the image source: preview > current display URL
  const imageToDisplay = previewUrl || currentDisplayUrl;

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>{label}</Label>

      {/* Display current/preview image */}
      {imageToDisplay && (
        <div className="mt-2 mb-2 border border-faded-gold rounded p-2 inline-block relative group">
          <img
            src={imageToDisplay}
            alt="Image preview"
            className="max-h-40 max-w-full rounded"
          />
          {/* Optional: Add a button to remove the *existing* image? */}
          {/* This would require another callback prop like `onImageRemove` */}
        </div>
      )}

      {/* Hidden file input */}
      <Input
        id={`file-upload-${folderName}`} // Make ID unique if multiple uploaders used
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedImageTypes.join(",")}
        className="hidden"
        disabled={isUploading}
      />

      {/* Button to trigger file selection */}
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="border-faded-gold text-sm"
      >
        {imageToDisplay ? buttonTextChange : buttonTextSelect}
      </Button>

      {/* Display selected file info, Upload button, and Cancel button */}
      {selectedFile && uploadStatus !== 'success' && (
        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
          <span>Selected: {selectedFile.name}</span>
          <Button
            type="button"
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading} // Disable only if actively uploading
            className="bg-terracotta hover:bg-terracotta/90 text-white"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            Upload
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleCancelSelection}
            disabled={isUploading}
            className="text-destructive hover:bg-destructive/10"
            aria-label="Cancel selection"
          >
             <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
        </div>
      )}

      {/* Status Indicators */}
      {uploadStatus === 'uploading' && <p className="text-sm text-blue-600 flex items-center gap-1 mt-2"><Loader2 className="h-4 w-4 animate-spin" />Uploading...</p>}
      {/* Provide more context on success if needed, or just rely on toast */}
      {uploadStatus === 'success' && !selectedFile && <p className="text-sm text-green-600 flex items-center gap-1 mt-2"><CheckCircle className="h-4 w-4" />Upload successful!</p>}
      {uploadStatus === 'error' && <p className="text-sm text-destructive flex items-center gap-1 mt-2"><AlertCircle className="h-4 w-4" />Error: {uploadError}</p>}
    </div>
  );
}