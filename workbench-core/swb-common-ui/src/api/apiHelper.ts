/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import axios, { AxiosRequestConfig } from 'axios';

const urlBase: string | undefined = process.env.NEXT_PUBLIC_API_BASE_URL;

const fetchData = async (options: AxiosRequestConfig): Promise<any> => {
  // add the CSRF header
  const csrfToken = localStorage.getItem('csrfToken');
  if (csrfToken) {
    options.headers = { 'csrf-token': csrfToken };
  }
  //TODO add auth token and error handling
  const { data } = await axios(options).catch(function (error: any) {
    console.log(error);
    //TODO: call logger to capture exception
    throw new Error('there was an error while trying to retrieve data');
  });
  return data;
};

const httpApiGet = async (urlPath: string, params: any, withCredentials: boolean = true): Promise<any> => {
  const options = {
    method: 'GET',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};
const httpApiPost = async (urlPath: string, params: any, withCredentials: boolean = true): Promise<any> => {
  const options = {
    method: 'POST',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};
const httpApiPut = async (urlPath: string, params: any, withCredentials: boolean = true): Promise<any> => {
  const options = {
    method: 'PUT',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};
const httpApiDelete = async (urlPath: string, params: any, withCredentials: boolean = true): Promise<any> => {
  const options = {
    method: 'DELETE',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};



export { httpApiGet, httpApiPost, httpApiPut, httpApiDelete };
