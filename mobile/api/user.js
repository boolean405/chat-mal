import api from "../config/axios";
import { jwtDecode } from "jwt-decode";

import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";

// Check user exist or not
export async function existEmail(email) {
  try {
    const response = await api.get("/api/user/exist-email", {
      params: {
        email,
      },
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Check username exist or not
export async function existUsername(username) {
  try {
    const response = await api.get("/api/user/exist-username", {
      params: {
        username,
      },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Register
export async function register(name, username, email, password) {
  try {
    const response = await api.post("/api/user/register", {
      name,
      username,
      email,
      password,
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Register verify
export async function registerVerify(email, code) {
  try {
    const response = await api.post("/api/user/register-verify", {
      email,
      code,
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Forgot password
export async function forgotPassword(email) {
  try {
    const response = await api.post("/api/user/forgot-password", {
      email,
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Forgot password verify
export async function forgotPasswordVerify(email, code) {
  try {
    const response = await api.post("/api/user/forgot-password-verify", {
      email,
      code,
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Reset password
export async function resetPassword(email, password) {
  try {
    const response = await api.patch("/api/user/reset-password", {
      email,
      newPassword: password,
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Login
export async function login(email, password) {
  try {
    const response = await api.post("/api/user/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Login google
export async function loginGoogle(user) {
  try {
    const response = await api.post("/api/user/login-google", {
      name: user.name,
      email: user.email,
      profilePhoto: user.photo,
      googleId: user.id,
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Google login failed!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Login facebook
export async function loginFacebook(accessToken) {
  try {
    const response = await api.post("/api/user/login-facebook", {
      accessToken,
    });

    return response;
  } catch (error) {
    const message = error.response?.data?.message || "Google login failed!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Upload photo
export async function uploadPhoto(profilePhoto, coverPhoto) {
  try {
    await refresh();
    const obj = {};

    if (profilePhoto) obj.profilePhoto = profilePhoto;
    if (coverPhoto) obj.coverPhoto = coverPhoto;

    const response = await api.patch("/api/user/upload-photo", obj);

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Upload photo with form data
// export async function uploadPhoto(profilePhoto, coverPhoto) {
//   try {
//     await refresh();
//     const formData = new FormData();
//     const addFile = async (uri, fieldName, fileName) => {
//       const fileExtension = uri.split(".").pop() || "jpg";
//       const mimeType = `image/${fileExtension}`;

//       formData.append(fieldName, {
//         uri,
//         name: `${fileName}.${fileExtension}`,
//         type: mimeType,
//       });
//     };

//     if (profilePhoto) await addFile(profilePhoto, "profilePhoto", "profile");
//     if (coverPhoto) await addFile(coverPhoto, "coverPhoto", "cover");

//     const response = await api.patch("/api/user/upload-photo", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     const data = response.data;
//     // Save user data to localstorage
//     if (data.status)
//       await saveUserData(data.result.user, data.result.accessToken);

//     return data;
//   } catch (error) {
//     const message = error.response?.data?.message || "Something went wrong";
//     const customError = new Error(message);
//     customError.status = error.response?.status;
//     throw customError;
//   }
// }

// Refresh access token
export async function refresh() {
  try {
    const accessToken = useAuthStore.getState().accessToken;
    const setUser = useAuthStore.getState().setUser;
    if (accessToken) {
      const decoded = jwtDecode(accessToken);

      if (decoded.exp < Date.now() / 1000) {
        console.log("token exp");
        const response = await api.post("/api/user/refresh");
        const data = response.data;
        if (data.status) {
          setUser(data.result.user, data.result.accessToken);
          console.log("new accessToken", data.result.accessToken, "new");
          return data.result.accessToken;
        } else throw new Error(data.message || "Failed to refresh token!");
      }
    }
    return accessToken;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to refresh token!";

    if (
      error.response?.data?.status === false &&
      error.response?.status === 401
    ) {
      alert("Your session has expired. Please log in again!");
      useChatStore.getState().clearAllChats();
      useMessageStore.getState().clearAllMessages();
      useAuthStore.getState().logout(); // clears state and navigates to auth screen
    }
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Edit profile change names
export async function changeNames(name, username) {
  try {
    await refresh();
    const user = useAuthStore.getState().user;
    const payload = {};

    if (name && user.name !== name) payload.name = name;
    if (username && user.username !== username) payload.username = username;

    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update!");
    }

    const response = await api.patch("/api/user/change-names", payload);

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}
// export async function editProfile(name, username, profilePhoto, coverPhoto) {
//   try {
//     const user = await getUserData();
//     const payload = {};

//     if (name && user.name !== name) payload.name = name;
//     if (username && user.username !== username) payload.username = username;
//     if (profilePhoto && user.profilePhoto !== profilePhoto)
//       payload.profilePhoto = profilePhoto;
//     if (coverPhoto && user.coverPhoto !== coverPhoto)
//       payload.coverPhoto = coverPhoto;

//     if (Object.keys(payload).length === 0) {
//       throw new Error("Nothing to update!");
//     }

//     await refresh();
//     const response = await api.patch("/api/user/edit-profile", payload);
//     const data = response.data;

//     // Save user data to localstorage
//     await saveUserData(data.result.user);

//     return data;
//   } catch (error) {
//     const message =
//       error.message || error.response?.data?.message || "Something went wrong";
//     throw new Error(message);
//   }
// }

// Delete photo
export async function deletePhoto(photo, type) {
  try {
    await refresh();
    const obj = {};

    obj[type] = photo;

    const response = await api.patch("/api/user/delete-photo", obj);
    const data = response.data;

    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Search user with keyword
export async function getPaginateUsers({ PageNum, keyword, gender, sort }) {
  try {
    await refresh();
    const response = await api.get(
      `/api/user/paginate/${sort}/${PageNum}?keyword=${keyword.trim()}&gender=${gender}`
    );
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Update push token
export async function updatePushToken(pushToken) {
  try {
    await refresh();
    const response = await api.post(`/api/user/update-push-token`, {
      pushToken,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Update push token failed!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// logout
export async function logout() {
  try {
    const response = await api.post(`/api/user/logout`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to logout!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Get me
export async function getMe() {
  try {
    const response = await api.get(`/api/user`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to get me!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}
// Follow user
export async function follow(userId) {
  try {
    const response = await api.post(`/api/user/follow`, {
      userId,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to follow user!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Unfollow user
export async function unfollow(userId) {
  try {
    const response = await api.delete(`/api/user/unfollow/${userId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to unfollow user!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Check is following or not
export async function checkIsFollowing(userId) {
  try {
    const response = await api.get(`/api/user/is-following/${userId}`);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to check is following or not!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Get all paginate follow users
export async function getPaginatedFollowUsers({
  pageNum,
  type = "friends",
  sort = "online",
  keyword = "",
}) {
  try {
    const response = await api.get(
      `/api/user/paginate/follow/${type}/${sort}/${pageNum}?keyword=${keyword.trim()}`
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to check is following or not!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Block user
export async function block(userId) {
  try {
    const response = await api.post(`/api/user/block`, {
      userId,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to block user!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Unblock user
export async function unblock(userId) {
  try {
    const response = await api.delete(`/api/user/unfollow/${userId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to unblock user!";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}
