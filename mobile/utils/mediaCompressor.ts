import { Video, Image } from "react-native-compressor";

export async function videoCompressor(uri: string) {
  return await Video.compress(uri);
}

export async function imageCompressor(uri: string) {
  return await Image.compress(uri);
}
