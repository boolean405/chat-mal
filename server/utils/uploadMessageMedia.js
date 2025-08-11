import resError from "./resError.js";
import cloudinary from "../config/cloudinary.js";

export default async function uploadMessageMedia(
  chat,
  type,
  base64Media,
  folder
) {
  try {
    // Validate type
    if (type !== "image" && type !== "video") {
      throw resError(400, "Only image and video are allowed!");
    }

    // Custom file name
    const public_id = `${chat._id}_${type}_${Date.now()}`;

    // Upload new base64Media
    const result = await cloudinary.uploader.upload(base64Media, {
      folder,
      public_id,
      resource_type: type,
    });
    if (!result) {
      throw resError(400, "Cloudinary upload failed!");
    }

    return result.secure_url;
  } catch (err) {
    throw resError(400, "Failed to upload base64Media to Cloudinary");
  }
}
