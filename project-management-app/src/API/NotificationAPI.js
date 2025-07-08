import { requestWrapper } from "./AuthAPI";
import { getUserId } from "./AuthAPI";

const NOTIFICATION_API_URL = "http://localhost:5179/api/Notification";

export const getNotificationsByUserId = async () => {
  var userId = await getUserId();
  if (userId == null) {
    return;
  }
  return await requestWrapper(`${NOTIFICATION_API_URL}/${userId}`, "GET");
};

export const markRead = async (notificationId) => {
  return await requestWrapper(`${NOTIFICATION_API_URL}/${notificationId}/read`, "PUT");
};

export const deleteNotificationById = async (notificationId) => {
  return await requestWrapper(`${NOTIFICATION_API_URL}/${notificationId}`, "DELETE");
};