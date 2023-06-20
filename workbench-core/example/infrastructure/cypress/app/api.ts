import axios, { AxiosInstance } from 'axios';

export const getApi = (): AxiosInstance => {
  const csrfToken = localStorage.getItem('csrfToken');

  const api = axios.create({
    baseURL: REST_API_ENDPOINT,
    withCredentials: true,
    headers: csrfToken
      ? {
          'csrf-token': csrfToken
        }
      : {}
  });

  api.interceptors.response.use((response) => {
    const { csrfToken, idToken } = response.data;

    // Make sure to always have latest CSRF token from responses
    if (csrfToken) {
      localStorage.setItem('csrfToken', csrfToken);
    }
    if (idToken) {
      localStorage.setItem('idToken', idToken);
    }

    return response;
  });

  return api;
};
