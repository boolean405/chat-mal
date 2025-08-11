import resError from "./resError.js";
import cloudinary from "../config/cloudinary.js";

export default async function uploadAuthPhoto({
  username,
  type,
  photourl,
  folder,
}) {
  try {
    // Validate type
    if (type !== "profilePhoto") {
      throw resError(400, "Only profile photo uploads are allowed!");
    }

    // Custom file name
    const public_id = `${username}_${type}_${Date.now()}`;

    // Upload new base64Media
    const result = await cloudinary.uploader.upload(photourl, {
      folder,
      public_id,
      resource_type: "image",
    });
    if (!result) {
      throw resError(400, "Cloudinary upload failed!");
    }

    return result.secure_url;
  } catch (err) {
    throw resError(400, "Failed to upload oauth profile photo to Cloudinary");
  }
}
