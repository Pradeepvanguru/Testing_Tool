
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
export const createRelease = (projectId, releaseData) => request(`/releases/add-release`, { method: 'POST', body: JSON.stringify({...releaseData, ProjectID:projectId}) });

export const getRunsByReleaseId = (projectId,releaseId) => request(`/runs/${projectId}/${releaseId}`);
export const createRun = (releaseId,runData,projectId) => request(`/runs/add-run`, { method: 'POST', body: JSON.stringify({...runData,ReleaseID: releaseId,ProjectID: projectId})});

export const getTestCasesByRunId = (projectId,releaseId, runID) => request(`/testcases/${projectId}/${releaseId}/${runID}`);
export const createTestCase = (testCaseData) => request('/testcases/add-testcase', { method: 'POST',body: JSON.stringify(testCaseData),headers: { 'Content-Type': 'application/json' },
  });


// Get test steps by TestCaseID
export const getTestStepsByTestCaseId = async (ProjectID, ReleaseID, RunID, testCaseId) => {
  request(`/teststeps/${ProjectID}/${ReleaseID}/${RunID}/${testCaseId}`);
};

// Save test case with steps (for the Save button)
export const saveTestCaseWithSteps = async (testCaseData) => {
  request('/teststeps/save', {
    method: 'POST',
    body: JSON.stringify(testCaseData),
  });
};

// Create test case with steps
export const createTestCaseWithSteps = async (testCaseData) => {
  request('/teststeps', {
    method: 'POST',
    body: JSON.stringify(testCaseData),
  });
};


export const updateTestStep = async (stepId, stepData) => {
  // This is for backward compatibility - you might want to remove this
  // and use saveTestCaseWithSteps instead
  console.warn('updateTestStep is deprecated, use saveTestCaseWithSteps instead');
  return Promise.resolve({ message: 'Use saveTestCaseWithSteps instead' });
};

export const deleteTestStep = async (stepId) => {
  // This is for backward compatibility - you might want to remove this
  // and handle deletion in the frontend before saving
  console.warn('deleteTestStep is deprecated, handle deletion in frontend before saving');
  return Promise.resolve({ message: 'Handle deletion in frontend before saving' });
};

export const loginUser = (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const signupUser = (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
export const getUserProfile = () => request('/auth/profile');
