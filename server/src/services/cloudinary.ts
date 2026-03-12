// =============================================================
// SERVICE CLOUDINARY - Upload d'images vers Cloudinary CDN
// =============================================================

import { v2 as cloudinary } from "cloudinary";

// --- Configurer Cloudinary ---
export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// --- Upload une image, retourne l'URL securisee ---
export const uploadImage = async (
  filePath: string,
  folder: string,
  publicId: string
): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "zendo/" + folder,
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });
  return result.secure_url;
};
