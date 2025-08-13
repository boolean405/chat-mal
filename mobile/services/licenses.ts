// TypeScript
import { ReactNativeLegal } from "react-native-legal";

export async function fetchLicenses() {
  // Returns { data: Library[] }
  const response = await ReactNativeLegal.getLibrariesAsync();
  return response.data;
}
