export default function getImageMimeType(fileName: string | null) {
  if (!fileName || typeof fileName !== "string") {
    return "image/jpeg";
  }

  const extension = fileName.split("?")[0].split(".").pop()?.toLowerCase();

  return extension === "jpg" ? "image/jpeg" : `image/${extension}`;
}
