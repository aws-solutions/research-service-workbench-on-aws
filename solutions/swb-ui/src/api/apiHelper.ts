/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

const urlBase: string | undefined = process.env.NEXT_PUBLIC_API_BASE_URL;

const httpApiGet = async (urlPath: string, params: any, withCredentials: boolean = false): Promise<any> => {
  const options = {
    method: 'GET',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};
const httpApiPost = async (urlPath: string, params: any, withCredentials: boolean = false): Promise<any> => {
  const options = {
    method: 'POST',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};
const httpApiPut = async (urlPath: string, params: any, withCredentials: boolean = false): Promise<any> => {
  const options = {
    method: 'PUT',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};
const httpApiDelete = async (
  urlPath: string,
  params: any,
  withCredentials: boolean = false
): Promise<any> => {
  const options = {
    method: 'DELETE',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};

const fetchData = async (options: any): Promise<any> => {
  // TODO: remove these headers once accessToken is properly set by cookies
  options.headers = { Authorization: `${localStorage.getItem('accessToken')}` };
  //TODO add auth token and error handling
  const { data } = await axios(options).catch(function (error) {
    console.log(error);
    //TODO: call logger to capture exception
    throw 'there was an error while trying to retrieve data';
  });
  return data;
};

export { httpApiGet, httpApiPost, httpApiPut, httpApiDelete };
