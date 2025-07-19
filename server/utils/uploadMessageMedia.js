import resError from "./resError.js";
import cloudinary from "../config/cloudinary.js";

export default async function uploadMessageMedia(
  chat,
  type,
  imageBase64,
  folder
) {
  try {
    // Validate type
    if (type !== "image" && type !== "video") {
      throw resError(400, "Only image and video are allowed!");
    }

    // Image upload
    if (type === "image") {
      // Custom file name
      const public_id = `${chat._id}_${type}_${Date.now()}`;

      // Upload new imageBase64
      const result = await cloudinary.uploader.upload(imageBase64, {
        folder,
        public_id,
      });
      if (!result) throw resError(400, "Cloudinary upload failed!");

      return result.secure_url;
    }
    return null;
  } catch (err) {
    throw resError(400, "Failed to upload imageBase64 to Cloudinary");
  }
}
