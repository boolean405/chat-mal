import resError from "./resError.js";
import cloudinary from "../config/cloudinary.js";
import getPublicIdFromUrl from "./getPublicIdFromUrl.js";

export default async function uploadGroupPhoto(
  group = null,
  type,
  imageBase64,
  folder
) {
  try {
    // Validate type
    if (type !== "photo") throw resError(400, "Only photo are allowed!");

    // Get the current imageBase64 URL dynamically
    const oldImageUrl = group ? group[type] : null;

    // Remove old imageBase64 if it's hosted on Cloudinary
    if (oldImageUrl && oldImageUrl.includes("cloudinary")) {
      const publicId = getPublicIdFromUrl(oldImageUrl);
      if (!publicId) throw resError(400, "Failed to parse public ID!");
      await cloudinary.uploader.destroy(publicId);
    }

    // Custom file name
    const name = group ? group.name : "created_group";
    const public_id = `${name}_${type}_${Date.now()}`;

    // Upload new imageBase64
    const result = await cloudinary.uploader.upload(imageBase64, {
      folder,
      public_id,
    });
    if (!result) throw resError(400, "Cloudinary group photo upload failed!");

    return result.secure_url;
  } catch (err) {
    throw resError(400, "Failed to upload group photo to Cloudinary");
  }
}
