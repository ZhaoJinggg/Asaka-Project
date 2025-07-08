import { requestWrapper } from "./AuthAPI";

const ATTACHMENT_API_URL = "http://localhost:5179/api/Attachment"; // Change port if needed

export const getAllAttachments = async () => {
  return await requestWrapper(ATTACHMENT_API_URL, "GET");
};

export const getAttachmentByAttachmentId = async (attachmentId) => {
  return await requestWrapper(`${ATTACHMENT_API_URL}/${attachmentId}`, "GET");
};

export const getAttachmentsByProjectTaskId = async (projectTaskId) => {
  return await requestWrapper(`${ATTACHMENT_API_URL}/projecttask/${projectTaskId}`, "GET");
};

export const uploadAttachment = async (projectTaskId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  // requestWrapper does not handle FormData by default, so we use fetch with token
  // Get token from localStorage (similar to requestWrapper)
  const tokens = JSON.parse(localStorage.getItem("tokens"));
  const accessToken = tokens?.accessToken;

  const response = await fetch(`${ATTACHMENT_API_URL}/${projectTaskId}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to upload attachment");
  return await response.json();
};

export const downloadAttachment = async (attachmentId) => {
  // Get token from localStorage
  const tokens = JSON.parse(localStorage.getItem("tokens"));
  const accessToken = tokens?.accessToken;

  const response = await fetch(`${ATTACHMENT_API_URL}/${attachmentId}/download`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error("Failed to download attachment");
  return await response.blob();
};

export const deleteAttachment = async (attachmentId) => {
  return await requestWrapper(`${ATTACHMENT_API_URL}/${attachmentId}/delete`, "DELETE");
};