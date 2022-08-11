#!/usr/bin/env node

/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const axios = require('axios');

const httpApiGet = async (accessToken, urlBase, urlPath, params, withCredentials = false) => {
  const options = {
    headers: { Authorization: accessToken },
    method: 'GET',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};
const httpApiPost = async (accessToken, urlBase, urlPath, params, withCredentials = false) => {
  const options = {
    headers: { Authorization: accessToken },
    method: 'POST',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};
const httpApiPut = async (accessToken, urlBase, urlPath, params, withCredentials = false) => {
  const options = {
    headers: { Authorization: accessToken },
    method: 'PUT',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};
const httpApiDelete = async (accessToken, urlBase, urlPath, params, withCredentials = false) => {
  const options = {
    headers: { Authorization: accessToken },
    method: 'DELETE',
    url: `${urlBase}${urlPath}`,
    data: params,
    withCredentials
  };
  return await fetchData(options);
};

const fetchData = async (options) => {
  //TODO add auth token and error handling
  const { data } = await axios(options).catch(function (error) {
    console.log(error);
    //TODO: call logger to capture exception
    throw 'there was an error while trying to retrieve data';
  });
  return data;
};

module.exports = { httpApiGet, httpApiPost, httpApiPut, httpApiDelete };
