import api from "../config/axios";
import { jwtDecode } from "jwt-decode";

import {
  getAccessToken,
  getUserData,
  saveUserData,
} from "../storage/authStorage";

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
    const data = response.data;
    // Save user data to localstorage
    // if (data.status) {
    //   await saveUserData(data.result.user, data.result.accessToken);
    // }

    return data;
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
    const data = response.data;
    // Save user data to localstorage
    if (data.status)
      await saveUserData(data.result.user, data.result.accessToken);

    return data;
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
    const data = response.data;

    // Save user data to localstorage
    if (data.status)
      await saveUserData(data.result, data.result.accessToken);

    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
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
    const data = response.data;
    // Save user data to localstorage
    // if (data.status)
    //   await saveUserData(data.result.user, data.result.accessToken);

    return data;
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
    const accessToken = await getAccessToken();
    if (accessToken) {
      const decoded = jwtDecode(accessToken);

      if (decoded.exp < Date.now() / 1000) {
        const response = await api.post("/api/user/refresh");
        const data = response.data;
        // Save user data to localstorage
        if (data.status)
          await saveUserData(data.result.user, data.result.accessToken);
        return data.result.accessToken;
      }
    }
    return accessToken;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Edit profile change names
export async function changeNames(name, username) {
  try {
    await refresh();
    const user = await getUserData();
    const payload = {};

    if (name && user.name !== name) payload.name = name;
    if (username && user.username !== username) payload.username = username;

    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update!");
    }

    await refresh();
    const response = await api.patch("/api/user/change-names", payload);
    const data = response.data;
    // Save user data to localstorage
    await saveUserData(data.result.user);

    return data;
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
    // Save user data to localstorage
    if (data.status)
      await saveUserData(data.result.user, data.result.accessToken);

    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}

// Search user with keyword
export async function getPaginateUsers(PageNum, keyword, gender, isOnline) {
  try {
    await refresh();
    const response = await api.get(
      `/api/user/paginate/${PageNum}?keyword=${keyword}&gender=${gender}&isOnline=${isOnline}`
    );
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    throw customError;
  }
}
