// server/imagekit-helper.ts
import ImageKit from 'imagekit';
// Remove FolderCreateOptions from this import
import type { FileObject, UploadResponse } from 'imagekit/dist/libs/interfaces';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

// --- Initialize ImageKit SDK --- (Ensure this is robust)
let imagekit: ImageKit | null = null;
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

if (publicKey && privateKey && urlEndpoint) {
    imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
    console.log("[ImageKit Helper] SDK Initialized successfully.");
} else {
    console.error("[ImageKit Helper] SDK NOT initialized. Required environment variables missing!");
    // Optional: throw an error if ImageKit is essential
    // throw new Error("ImageKit configuration is incomplete.");
}

/**
 * Ensures a folder exists in ImageKit, creating it if necessary.
 * @param folderName - The desired folder name (e.g., "tours", "gallery", "site-assets").
 * @param parentFolderPath - The path of the parent folder (default: "/").
 * @returns {Promise<string>} The full path of the ensured folder.
 */
async function ensureFolderExists(folderName: string, parentFolderPath: string = "/"): Promise<string> {
    if (!imagekit) throw new Error("ImageKit SDK is not initialized.");
    if (!folderName || folderName.includes('/')) {
        throw new Error("Invalid folder name provided.");
    }

    const fullFolderPath = `${parentFolderPath}${folderName}/`.replace('//', '/'); // Ensure single slash

    try {
        // Check if folder exists (using listFiles is a common workaround)
        await imagekit.listFiles({ path: fullFolderPath, limit: 1 });
        console.log(`[ImageKit Helper] Folder already exists: ${fullFolderPath}`);
        return fullFolderPath;
    } catch (error: any) {
        // If listing fails (often 404-like), try creating it
        if (error.message && (error.message.includes('does not exist') || error.httpStatusCode === 404)) {
            console.log(`[ImageKit Helper] Folder not found, creating: ${fullFolderPath}`);
            try {
                // Define the options object directly without the explicit type
                const createOptions = { // <-- REMOVED : FolderCreateOptions annotation
                    folderName: folderName,
                    parentFolderPath: parentFolderPath,
                };
                await imagekit.createFolder(createOptions); // Pass the object directly
                console.log(`[ImageKit Helper] Folder created successfully: ${fullFolderPath}`);
                return fullFolderPath;
            } catch (createError) {
                console.error(`[ImageKit Helper] Error creating folder ${fullFolderPath}:`, createError);
                throw new Error(`Failed to create ImageKit folder: ${folderName}`);
            }
        } else {
            // Re-throw unexpected errors during listing
            console.error(`[ImageKit Helper] Error checking folder existence ${fullFolderPath}:`, error);
            throw new Error(`Failed to check ImageKit folder existence: ${folderName}`);
        }
    }
}

/**
 * Uploads a file buffer to a specified folder in ImageKit.
 * Ensures the folder exists before uploading.
 * @param fileBuffer - The file content as a Buffer.
 * @param fileName - The desired filename in ImageKit.
 * @param targetFolderName - The name of the target folder (e.g., "tours").
 * @param useUniqueFileName - Whether to append a unique ID to the filename (default: true).
 * @param tags - Optional tags for the image.
 * @returns {Promise<UploadResponse>} The ImageKit upload response.
 */
export async function uploadImageToFolder(
    fileBuffer: Buffer,
    fileName: string,
    targetFolderName: string,
    useUniqueFileName: boolean = true,
    tags?: string[]
): Promise<UploadResponse> {
    if (!imagekit) throw new Error("ImageKit SDK is not initialized.");

    try {
        // 1. Ensure the target folder exists
        const folderPath = await ensureFolderExists(targetFolderName, "/uploads/"); // Base uploads folder

        // 2. Prepare upload options
        const uploadOptions = {
            file: fileBuffer,
            fileName: fileName,
            folder: folderPath,
            useUniqueFileName: useUniqueFileName,
            tags: tags,
        };

        console.log(`[ImageKit Helper] Uploading "${fileName}" to folder "${folderPath}"...`);
        // 3. Perform the upload
        const result = await imagekit.upload(uploadOptions);
        console.log(`[ImageKit Helper] Upload successful: ${result.url}`);
        return result;

    } catch (error) {
        console.error(`[ImageKit Helper] Error during image upload to folder ${targetFolderName}:`, error);
        if (error instanceof Error) {
             throw new Error(`ImageKit upload failed: ${error.message}`);
        } else {
             throw new Error("ImageKit upload failed due to an unknown error.");
        }
    }
}

/**
 * Optional: Function to delete an image by fileId
 * @param fileId - The unique file ID from ImageKit.
 * @returns {Promise<void>}
 */
export async function deleteImage(fileId: string): Promise<void> {
     if (!imagekit) throw new Error("ImageKit SDK is not initialized.");
     try {
        console.log(`[ImageKit Helper] Deleting image with fileId: ${fileId}`);
        await imagekit.deleteFile(fileId);
        console.log(`[ImageKit Helper] Image ${fileId} deleted successfully.`);
     } catch (error) {
        console.error(`[ImageKit Helper] Error deleting image ${fileId}:`, error);
        if (error instanceof Error) {
             throw new Error(`ImageKit delete failed: ${error.message}`);
        } else {
             throw new Error("ImageKit delete failed due to an unknown error.");
        }
     }
}