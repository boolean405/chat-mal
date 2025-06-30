// Extract full public_id from the image URL
export default function getPublicIdFromUrl(url) {
  const parts = url.split("/");
  const versionIndex = parts.findIndex(
    (p) => p.startsWith("v") && !isNaN(p.substring(1))
  );
  const publicIdWithExt = parts.slice(versionIndex + 1).join("/"); // Get everything after the version
  const publicId = publicIdWithExt.substring(
    0,
    publicIdWithExt.lastIndexOf(".")
  ); // Remove extension
  return publicId;
}
