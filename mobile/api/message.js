import api from "@/config/axios";
import { refresh } from "@/api/user";

export async function getPaginateMessages(chatId, pageNum) {
  try {
    await refresh();
    const response = await api.get(
      `/api/message/paginate/${chatId}/${pageNum}`
    );
    const data = response.data;
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

export async function createMessage(chatId, content, type = "text") {
  try {
    await refresh();
    const response = await api.post("/api/message", {
      chatId,
      content,
      type,
    });
    const data = response.data;
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Delivered message
export async function messageDelivered(chatId) {
  try {
    await refresh();
    const response = await api.patch("/api/message/delivered", {
      chatId,
    });
    const data = response.data;
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}
