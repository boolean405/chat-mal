import resError from "./resError.js";
import cloudinary from "../config/cloudinary.js";
import getPublicIdFromUrl from "./getPublicIdFromUrl.js";

const uploadImage = async (user, type) => {
  try {
    // Validate type
    if (type !== "profilePhoto" && type !== "coverPhoto") {
      throw resError(400, "Only profilePhoto and coverPhoto are allowed!");
    }

    // Get the current image URL dynamically
    const oldImageUrl = user[type];

    // Remove old image if it's hosted on Cloudinary
    if (oldImageUrl && oldImageUrl.includes("cloudinary")) {
      const publicId = getPublicIdFromUrl(oldImageUrl);
      if (!publicId) throw resError(400, "Failed to parse public ID!");
      await cloudinary.uploader.destroy(publicId);
      return true;
    }

    return false;
  } catch (err) {
    throw resError(400, "Failed to delete image at Cloudinary");
  }
};

export default uploadImage;
