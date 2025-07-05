import api from "@/config/axios";
import { refresh } from "@/api/user";

export async function getPaginateChats(pageNum) {
  try {
    await refresh();
    const response = await api.get(`/api/chat/paginate/${pageNum}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

export async function getPaginateRequestChats(pageNum) {
  try {
    await refresh();
    const response = await api.get(`/api/chat/request/paginate/${pageNum}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Delete chat
export async function deleteChat(chatId) {
  try {
    await refresh();
    const response = await api.patch("/api/chat/delete-chat", {
      chatId,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Create group chat
export async function createGroup(userIds, name, groupPhoto) {
  try {
    await refresh();
    const payload = {};

    if (name) payload.name = name;
    if (userIds) payload.userIds = userIds;
    if (groupPhoto) payload.groupPhoto = groupPhoto;

    const response = await api.post("/api/chat/create-group", payload);

    const data = response.data;
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}
// Leave group
export async function leaveGroup(groupId) {
  try {
    await refresh();
    const response = await api.patch("/api/chat/leave-group", {
      groupId,
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

// Create or open chat
export async function createOrOpen(receiverId) {
  try {
    await refresh();
    const response = await api.post("/api/chat", {
      receiverId,
    });
    return response;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Get chat
export async function getChat(chatId) {
  try {
    await refresh();
    const response = await api.get(`/api/chat/${chatId}`);
    const data = response.data;
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}
// Add users to group
export async function addUsersToGroup(groupId, userIds) {
  try {
    await refresh();
    const response = await api.patch("/api/chat/add-users-to-group", {
      groupId,
      userIds,
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

// Accept chat request
export async function acceptChatRequest(chatId) {
  try {
    await refresh();
    const response = await api.patch("/api/chat/accept-chat-request", {
      chatId,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}
