import api from "@/config/axios";
import { refresh } from "@/api/user";

export async function createEvent(payload = {}) {
  try {
    await refresh();
    const response = await api.post("/api/event", payload);
    const data = response.data;
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

export async function getPaginatedEvents({
  pageNum,
  sort = "upcoming",
  keyword = "",
  withinDays,
}) {
  try {
    if (withinDays === 0) withinDays = "";

    await refresh();
    const response = await api.get(
      `/api/event/paginate/${sort}/${pageNum}?withinDays=${withinDays}&keyword=${keyword}`
    );
    const data = response.data;
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}
