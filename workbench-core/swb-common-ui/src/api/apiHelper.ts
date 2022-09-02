/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import axios, { AxiosRequestConfig } from 'axios';

const urlBase: string | undefined = process.env.NEXT_PUBLIC_API_BASE_URL;

// TODO: Use generics instead of using any for methods here

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchData = async (options: AxiosRequestConfig): Promise<any> => {
  // add the CSRF header
  const csrfToken = localStorage.getItem('csrfToken');
  if (csrfToken) {
    options.headers = { 'csrf-token': csrfToken };
  }
  //TODO add auth token and error handling
  const { data } = await axios(options).catch(function (error: Error) {
    console.log(error);
    //TODO: call logger to capture exception
    throw new Error('there was an error while trying to retrieve data');
  });
  return data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const httpApiGet = async (urlPath: string, params: any, withCredentials: boolean = true): Promise<any> => {
  const options = {
    method: 'GET',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const httpApiPost = async (urlPath: string, params: any, withCredentials: boolean = true): Promise<any> => {
  const options = {
    method: 'POST',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const httpApiPut = async (urlPath: string, params: any, withCredentials: boolean = true): Promise<any> => {
  const options = {
    method: 'PUT',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const httpApiDelete = async (urlPath: string, params: any, withCredentials: boolean = true): Promise<any> => {
  const options = {
    method: 'DELETE',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};

// Response interceptor for API calls
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  // eslint-disable-next-line @typescript-eslint/typedef
  async function (error) {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const response = await httpApiGet('refresh', {});
      localStorage.setItem('idToken', response.idToken);
      return axios(originalRequest);
    }
    return Promise.reject(error);
  }
);

export { httpApiGet, httpApiPost, httpApiPut, httpApiDelete };
