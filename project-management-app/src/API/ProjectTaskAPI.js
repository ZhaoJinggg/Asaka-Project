import { requestWrapper, getUserId, isTokenValid, refreshTokens } from "./AuthAPI";
import axios from "axios";

const TASK_API_URL = "http://localhost:5179/api/ProjectTask";

// Get all tasks (admin or all)
export const getAllTasks = async () => {
  const response = await requestWrapper(TASK_API_URL, "GET");
  const data = response?.data || response;
  console.log('Fetched tasks:', data);
  return Array.isArray(data) ? data : [];
};

// Get all tasks assigned to the current user
export const getAllTasksByUserId = async () => {
  const userId = await getUserId();
  if (!userId) return;
  return await requestWrapper(`${TASK_API_URL}/assigned-tasks/${userId}`, "GET");
};

// Get all tasks owned by the current user
export const getOwnedTasksByUserId = async () => {
  const userId = await getUserId();
  if (!userId) return;
  return await requestWrapper(`${TASK_API_URL}/owned-tasks/${userId}`, "GET");
};

// Get a single task by ID
export const getTaskById = async (taskId) => {
  return await requestWrapper(`${TASK_API_URL}/${taskId}`, "GET");
};

// --- CRUD (keep these if needed for add/update/delete) ---
export const addTask = async (projectId, data) => {
  const userId = await getUserId();
  if (!userId) return;
  return await requestWrapper(`${TASK_API_URL}/${projectId}/${userId}`, "POST", { ...data });
};

export const updateTask = async (taskId, data) => {
  return await requestWrapper(`${TASK_API_URL}/${taskId}`, "PUT", { ...data });
};

export const deleteTask = async (taskId) => {
  return await requestWrapper(`${TASK_API_URL}/${taskId}`, "DELETE");
};

export const updateTaskStatus = async (taskId, status) => {
  return await requestWrapper(`${TASK_API_URL}/${taskId}/status`, "PUT", {
    status: status,
  });
};

export const assignTaskToUser = async (taskId, userId) => {
  return await requestWrapper(`${TASK_API_URL}/${taskId}/assign`, "PUT", {
    assigneeId: userId,
  });
};

export const getTasksByStatus = async (status) => {
  return await requestWrapper(`${TASK_API_URL}/status/${status}`, "GET");
};

export const getTasksByPriority = async (priority) => {
  return await requestWrapper(`${TASK_API_URL}/priority/${priority}`, "GET");
};

export const searchTasks = async (searchTerm) => {
  return await requestWrapper(`${TASK_API_URL}/search?q=${encodeURIComponent(searchTerm)}`, "GET");
};

export const getTasksByDateRange = async (startDate, endDate) => {
  return await requestWrapper(`${TASK_API_URL}/date-range?startDate=${startDate}&endDate=${endDate}`, "GET");
};

export const bulkUpdateTasks = async (taskIds, updates) => {
  return await requestWrapper(`${TASK_API_URL}/bulk-update`, "PUT", {
    taskIds: taskIds,
    updates: updates,
  });
};

export const duplicateTask = async (taskId) => {
  return await requestWrapper(`${TASK_API_URL}/${taskId}/duplicate`, "POST");
};

export const addTaskComment = async (taskId, comment) => {
  return await requestWrapper(`${TASK_API_URL}/${taskId}/comments`, "POST", {
    comment: comment,
  });
};

export const getTaskComments = async (taskId) => {
  return await requestWrapper(`${TASK_API_URL}/${taskId}/comments`, "GET");
};

export const addSubtask = async (taskId, userId, subtask) => {
  return await requestWrapper(`${TASK_API_URL}/${taskId}/${userId}/subtasks`, "POST", subtask);
};
// export const addTaskAttachment = async (taskId, file) => {
//   const formData = new FormData();
//   formData.append('file', file);
  
//   // Get authentication tokens
//   var { isValid, accessToken, refreshToken, userId } = isTokenValid();
  
//   // Refresh tokens when access token is expired
//   if (!isValid) {
//     try {
//       accessToken = await refreshTokens(userId, refreshToken);
//     } catch (e) {
//       throw e;
//     }
//   }
  
//   // Make the request with FormData
//   return await axios.post(`${TASK_API_URL}/${taskId}/attachments`, formData, {
//     headers: { 
//       Authorization: `Bearer ${accessToken}`,
//       'Content-Type': 'multipart/form-data'
//     },
//   });
// };

// export const getTaskAttachments = async (taskId) => {
//   return await requestWrapper(`${TASK_API_URL}/${taskId}/attachments`, "GET");
// };

// export const removeTaskAttachment = async (taskId, attachmentId) => {
//   return await requestWrapper(`${TASK_API_URL}/${taskId}/attachments/${attachmentId}`, "DELETE");
// }; 