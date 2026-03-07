"use client";
import { upload, ImageKitAbortError } from "@imagekit/next";
import { authenticator } from "@/components/ImageKitAuthenticator";

interface UploadConfig {
  file: File;
  maxSize: number; // in bytes
  allowedTypes: string[];
  folder?: string;
}

export const uploadFile = async (config: UploadConfig) => {
  const { file, maxSize, allowedTypes, folder } = config;
  const abortController = new AbortController();
  if (!allowedTypes.includes(file.type)) {
    return { success: false, message: "Invalid file type!" };
  }

  // Check Size (500KB limit)
  // 500KB in bytes
  if (file.size > maxSize) {
    return { success: false, message: "File size must be under 500KB." };
  }

  // Retrieve authentication parameters for the upload.
  let authParams;
  try {
    authParams = await authenticator();
  } catch {
    return { success: false, message: "Something went wrong! Try again later" };
  }
  const { signature, expire, token, publicKey } = authParams;
  let useUniqueFileName = false;
  if (folder === "post") useUniqueFileName = true;
  // Call the ImageKit SDK upload function with the required parameters and callbacks.
  try {
    const uploadResponse = await upload({
      // Authentication parameters
      expire,
      token,
      signature,
      publicKey,
      file,
      fileName: file.name,
      folder: folder, // Optionally set a custom file name
      useUniqueFileName: useUniqueFileName,
      // Abort signal to allow cancellation of the upload if needed.
      abortSignal: abortController.signal,
    });
    return { success: true, message: "file uploaded!", uploadResponse };
  } catch (error) {
    // Handle specific error types provided by the ImageKit SDK.
    if (error instanceof ImageKitAbortError) {
      return { success: false, message: "Upload aborted." };
    } else {
      return {
        success: false,
        message: "Something went wrong, Try again later!",
      };
    }
  }
};
