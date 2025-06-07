
import React from 'react';

// Update the API_BASE_URL to point to your backend server
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;


const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
     headers: {
      'Content-Type': 'application/json',
    },
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText || 'API request failed with no JSON response' };
    }
    console.error('API Error:', errorData);
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
};

export const getProjects = () => request('/projects');
export const createProject = (projectData) => request('/projects/add-project', { method: 'POST', body: JSON.stringify(projectData) });
export const getProjectById = (projectId) => request(`/projects/${projectId}`);

export const getReleasesByProjectId = (projectId) => request(`/releases/${projectId}`);
export const createRelease = (projectId, releaseData) => request(`/releases/addRelease/${projectId}`, { method: 'POST', body: JSON.stringify(releaseData) });

export const getRunsByReleaseId = (projectId,releaseId) => request(`/runs/${projectId}/${releaseId}`);
export const createRun = (releaseId,runData,projectId) => request(`/runs/addRun`, { method: 'POST', body: JSON.stringify({...runData,ReleaseID: releaseId,ProjectID: projectId}), });

export const getTestCasesByRunId = (runId) => request(`/testcases/${runId}`);
export const createTestCase = (runId, testCaseData) => request(`/testcases/addTestcase/${runId}`, { method: 'POST', body: JSON.stringify(testCaseData) });

export const getTestStepsByTestCaseId = (testCaseId) => request(`/testcases/${testCaseId}`);
export const createTestStep = (testCaseId, testStepData) => request(`/testcases/${testCaseId}/teststeps`, { method: 'POST', body: JSON.stringify(testStepData) });
export const updateTestStep = (testStepId, testStepData) => request(`/teststeps/${testStepId}`, { method: 'PUT', body: JSON.stringify(testStepData) });
export const deleteTestStep = (testStepId) => request(`/teststeps/${testStepId}`, { method: 'DELETE' });

export const loginUser = (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const signupUser = (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const getUserProfile = () => request('/auth/profile');
