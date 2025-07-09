import { requestWrapper } from "./AuthAPI";
import { getUserId } from "./AuthAPI";

const USER_API_URL = "http://localhost:5179/api/User";

export const getAllUsers = async () => {
  return await requestWrapper(USER_API_URL, "GET");
}

export const getUserById = async (userId) => {
  return await requestWrapper(`${USER_API_URL}/${userId}`, "GET");
}