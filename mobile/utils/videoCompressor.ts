import { Video } from "react-native-compressor";

export default async function videoCompressor(uri: string) {
  const compressedUri = await Video.compress(
    uri,
    {
      compressionMethod: "auto", // or 'manual'
    },
    (progress) => {
      console.log("Compression progress:", progress);
    }
  );
  return compressedUri;
}
