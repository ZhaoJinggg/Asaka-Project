import { requestWrapper } from "./AuthAPI";
import { getUserId } from "./AuthAPI";

const PROJECT_API_URL = "http://localhost:5179/api/Project";

export const getAllProjects = async () => {
  return await requestWrapper(PROJECT_API_URL, "GET");
};

export const getAllProjectsByUserId = async () => {
  var userId = await getUserId();
  if (userId == null) {
    return;
  }
  return await requestWrapper(`${PROJECT_API_URL}/assigned-projects/${userId}`, "GET");
};

export const getProjectById = async (projectId) => {
  return await requestWrapper(`${PROJECT_API_URL}/${projectId}`, "GET");
};

export const getOwnedProjects = async (userId) => {
  const response = await fetch(`${PROJECT_API_URL}/owned-projects/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch owned projects");
  return await response.json();
};

export const addProject = async (data) => {
  var userId = await getUserId();
  if (userId == null) {
    return;
  }
  return await requestWrapper(`${PROJECT_API_URL}/${userId}`, "POST", {
    ...data,
  });
};

export const updateProject = async (projectId, data) => {
  return await requestWrapper(`${PROJECT_API_URL}/${projectId}`, "PUT", {
    ...data,
  });
};

export const deleteProject = async (projectId) => {
  return await requestWrapper(`${PROJECT_API_URL}/${projectId}`, "DELETE");
};

// Assign a user to a project (makes them a member)
export const addProjectMember = async (projectId, userId) => {
  // Updated route: POST /api/Project/{projectId}/members/{userId}
  // Using POST since we are creating a new membership resource on the server
  return await requestWrapper(
    `${PROJECT_API_URL}/assign-user/${projectId}/${userId}`,
    "POST"
  );
};