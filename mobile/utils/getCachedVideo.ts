import * as FileSystem from "expo-file-system";

export default async (remoteUri: string): Promise<string> => {
  const filename = encodeURIComponent(remoteUri); // simple unique name
  const cachePath = `${FileSystem.cacheDirectory}${filename}.mp4`;

  const info = await FileSystem.getInfoAsync(cachePath);
  if (info.exists) {
    return cachePath;
  }

  // Download and save locally
  const { uri } = await FileSystem.downloadAsync(remoteUri, cachePath);
  return uri;
};