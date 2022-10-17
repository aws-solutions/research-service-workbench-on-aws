/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

/* eslint-disable-next-line */
export async function handler(event: any) {
  const URL = `${process.env.API_GW_URL!}/`;
  let HTTP_METHOD = '';

  const headers: { [id: string]: string } = {};
  const response: { [id: string]: unknown } = {};
  let body: { [id: string]: string } = {};
  let params: { [id: string]: string } = {};

  if (event.headers?.authorization) headers.authorization = event.headers.authorization;

  if (event.headers?.['content-type']) headers['content-type'] = event.headers['content-type'];

  // Fix to allow port forward header, needed for ipAddress and CIDR range values
  if (event.headers?.['x-forwarded-for']) headers['x-forwarded-for'] = event.headers['x-forwarded-for'];

  if (event.body && event.body!.length !== 0) body = JSON.parse(event.body);

  if (event.queryStringParameters) params = event.queryStringParameters;

  if (event.httpMethod) HTTP_METHOD = event.httpMethod;

  if (HTTP_METHOD === 'GET') {
    const { data } = await axios.get(URL, { headers, params });
    response.statusCode = 200;
    response.isBase64Encoded = false;
    response.body = data;
    response.headers = { 'content-type': 'application/json; charset=utf-8' };
  }

  if (HTTP_METHOD === 'POST') {
    const { data } = await axios.post(URL, { headers, params, body });
    response.statusCode = 201;
    response.isBase64Encoded = false;
    response.body = data;
    response.headers = { 'content-type': 'application/json; charset=utf-8' };
  }

  if (HTTP_METHOD === 'PUT') {
    const { data } = await axios.put(URL, { headers, params, body });
    response.statusCode = 200;
    response.isBase64Encoded = false;
    response.body = data;
    response.headers = { 'content-type': 'application/json; charset=utf-8' };
  }

  if (HTTP_METHOD === 'DELETE') {
    const { data } = await axios.delete(URL, { headers, params });
    response.statusCode = 200;
    response.isBase64Encoded = false;
    response.body = data;
    response.headers = { 'content-type': 'application/json; charset=utf-8' };
  }

  return response;
}
