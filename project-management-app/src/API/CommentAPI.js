import { requestWrapper, getUserId } from './AuthAPI';

const COMMENT_API_URL = 'http://localhost:5179/api/Comment';

export const getAllComments = async () => {
  return await requestWrapper(COMMENT_API_URL, 'GET');
};

export const getOwnedComments = async () => {
  const userId = await getUserId();
  if (!userId) return;
  return await requestWrapper(`${COMMENT_API_URL}/owned-comments/${userId}`, 'GET');
};

export const getCommentById = async (commentId) => {
  return await requestWrapper(`${COMMENT_API_URL}/${commentId}`, 'GET');
};

export const addComment = async (projectTaskId, data) => {
  const userId = await getUserId();
  if (!userId) return;
  return await requestWrapper(`${COMMENT_API_URL}/${projectTaskId}/${userId}`, 'POST', { ...data });
};

export const updateComment = async (commentId, data) => {
  return await requestWrapper(`${COMMENT_API_URL}/${commentId}`, 'PUT', { ...data });
};

export const deleteComment = async (commentId) => {
  return await requestWrapper(`${COMMENT_API_URL}/${commentId}`, 'DELETE');
};

export const getCommentsByProjectTaskId = async (projectTaskId) => {
  return await requestWrapper(`${COMMENT_API_URL}/project-task/${projectTaskId}`, 'GET');
};
