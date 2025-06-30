import resError from "./resError.js";
import cloudinary from "../config/cloudinary.js";
import getPublicIdFromUrl from "./getPublicIdFromUrl.js";

export default async function uploadUserPhoto(user, type, imageBase64, folder) {
  try {
    // Validate type
    if (type !== "profilePhoto" && type !== "coverPhoto") {
      throw resError(400, "Only profilePhoto and coverPhoto are allowed!");
    }

    // Get the current imageBase64 URL dynamically
    const oldImageUrl = user[type];

    // Remove old imageBase64 if it's hosted on Cloudinary
    if (oldImageUrl && oldImageUrl.includes("cloudinary")) {
      const publicId = getPublicIdFromUrl(oldImageUrl);
      if (!publicId) throw resError(400, "Failed to parse public ID!");
      await cloudinary.uploader.destroy(publicId);
    }

    // Custom file name
    const public_id = `${user.username}_${type}_${Date.now()}`;

    // Upload new imageBase64
    const result = await cloudinary.uploader.upload(imageBase64, {
      folder,
      public_id,
    });
    if (!result) throw resError(400, "Cloudinary upload failed!");

    return result.secure_url;
  } catch (err) {
    throw resError(400, "Failed to upload imageBase64 to Cloudinary");
  }
}

// import fs from "fs/promises";
// import cloudinary from "../config/cloudinary.js";
// import getPublicIdFromUrl from "./getPublicIdFromUrl.js";

// const uploadImage = async (user, fileData, folder) => {
//   // Remove old imageBase64 if exists and is hosted on Cloudinary
//   if (user.profilePhoto && user.profilePhoto.includes("cloudinary")) {
//     const publicId = getPublicIdFromUrl(user.profilePhoto);
//     if (!publicId) throw resError(400, "Failed to parse public ID!");
//     await cloudinary.uploader.destroy(publicId);
//   }

//   // Custom file name
//   const public_id = `/${user.username}_${Date.now()}`;

//   // Upload new imageBase64
//   const result = await cloudinary.uploader.upload(fileData.tempFilePath, {
//     folder,
//     public_id,
//   });
//   if (!result) throw resError(400, "Cloudinary upload failed!");
//   await fs.unlink(fileData.tempFilePath);

//   return result.secure_url;
// };

// export default uploadImage;
