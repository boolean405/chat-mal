import api from "@/config/axios";
import { refresh } from "@/api/user";

export async function createOrOpen() {
  try {
    await refresh();
    const response = await api.post("/api/been-together");
    const data = response.data;
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

export async function edit(payload) {
  try {
    await refresh();
    const response = await api.patch("/api/been-together", payload);
    const data = response.data;
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}
