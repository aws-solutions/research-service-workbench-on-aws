/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

/* eslint-disable-next-line */
export async function handler(event: any) {
  const baseUrl = process.env.API_GW_URL!.replace('/dev/', '/dev');
  let HTTP_METHOD = '';

  const headers: { [id: string]: string } = {};
  const response: {
    statusCode: number;
    statusDescription: string;
    body: unknown;
    isBase64Encoded: boolean;
    headers: unknown;
  } = {
    statusCode: 200,
    statusDescription: '',
    body: undefined,
    isBase64Encoded: false,
    headers: { 'Content-Type': 'application/json' }
  };
  let body: { [id: string]: string } = {};
  let params: { [id: string]: string } = {};

  // Short-circuit if this is a ALB health-check
  if (event.headers['user-agent'] && event.headers['user-agent'] === 'ELB-HealthChecker/2.0') return;

  // One more layer of logging incoming API calls
  console.log(`Proxy handler called with: ${JSON.stringify(event)}`);

  const targetPath = event.path ? `${baseUrl}${event.path}` : baseUrl;

  if (event.headers) {
    headers['Content-Type'] = event.headers['content-type'] || 'application/json';
    headers.Cookie = event.headers.cookie;
    headers['csrf-token'] = event.headers['csrf-token'];
    headers['x-forwarded-for'] = event.headers['x-forwarded-for'];
    headers.connection = event.headers.connection;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  if (event.body && event.body!.length !== 0) body = JSON.parse(event.body);
  if (event.queryStringParameters) params = event.queryStringParameters;
  if (event.httpMethod) HTTP_METHOD = event.httpMethod;

  if (HTTP_METHOD === 'GET') {
    const { data, status, statusText } = await axios.get(targetPath, { headers, params });
    response.statusCode = status;
    response.statusDescription = statusText;
    response.body = JSON.stringify(data);
  }

  if (HTTP_METHOD === 'POST') {
    const { data, status, statusText } = await axios.post(targetPath, { headers, params, body });
    response.statusCode = status;
    response.statusDescription = statusText;
    response.body = JSON.stringify(data);
  }

  if (HTTP_METHOD === 'PUT') {
    const { data, status, statusText } = await axios.put(targetPath, { headers, params, body });
    response.statusCode = status;
    response.statusDescription = statusText;
    response.body = JSON.stringify(data);
  }

  if (HTTP_METHOD === 'DELETE') {
    const { data, status, statusText } = await axios.delete(targetPath, { headers, params });
    response.statusCode = status;
    response.statusDescription = statusText;
    response.body = JSON.stringify(data);
  }

  // Logging what we returned for the given API call
  console.log(`Responding with: ${JSON.stringify(response)}`);

  return response;
}
