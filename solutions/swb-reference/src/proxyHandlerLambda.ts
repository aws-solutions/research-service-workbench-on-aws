/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import axios, { AxiosError } from 'axios';
import _ from 'lodash';
import HttpError from '../integration-tests/support/utils/HttpError';

/* eslint-disable-next-line */
export async function handler(event: any) {
  const baseUrl = process.env.API_GW_URL!.replace('/dev/', '/dev');
  let HTTP_METHOD = '';

  let reqHeaders: { [id: string]: string } = {};

  const response: {
    statusCode: number;
    statusDescription: string;
    body: unknown;
    isBase64Encoded: boolean;
    multiValueHeaders: Record<string, Array<unknown>>;
    headers: Record<string, unknown>;
  } = {
    statusCode: 200,
    statusDescription: '',
    body: undefined,
    isBase64Encoded: false,
    multiValueHeaders: { 'Content-Type': ['application/json'] },
    headers: { 'Content-Type': 'application/json' }
  };
  let body: { [id: string]: string } = {};
  let params: { [id: string]: string } = {};

  if (event.multiValueHeaders) {
    // In order to support array of cookies for set-cookies, multiValueHeaders is enabled on the ALB target
    // This makes all request headers come in under multiValueHeaders as arrays
    event.headers = {};
    Object.keys(event.multiValueHeaders).forEach((key) => {
      // eslint-disable-next-line security/detect-object-injection
      event.headers[key] = event.multiValueHeaders[key][0];
    });
  }

  // Short-circuit if this is a ALB health-check
  if (event.headers['user-agent'] && event.headers['user-agent'] === 'ELB-HealthChecker/2.0') {
    response.statusDescription = 'OK';
    return setupResponse(response, {}, 200, 'Health check passed', event.headers);
  }

  let apiPath = event.path ? event.path.replace('api/', '') : '';
  if (apiPath[apiPath.length - 1] === '/') {
    // SWB APIs do not have trailing slash, but this gets added when UI passes down the path
    apiPath = apiPath.substring(0, apiPath.length - 1);
  }
  const targetPath = encodeURI(`${baseUrl}${apiPath}`);

  if (event.httpMethod) HTTP_METHOD = event.httpMethod;
  if (event.headers) {
    reqHeaders['Content-Type'] = event.headers['content-type'] || 'application/json';
    reqHeaders.Cookie = event.headers.cookie;
    reqHeaders['csrf-token'] = event.headers['csrf-token'];
    reqHeaders['x-forwarded-for'] = event.headers['x-forwarded-for'];
    reqHeaders.connection = event.headers.connection;
    reqHeaders['Access-Control-Allow-Credentials'] = 'true';
    reqHeaders.accept = 'application/json, text/plain, */*';
    reqHeaders.connection = event.headers.connection || 'keep-alive';
    if (!reqHeaders.origin) reqHeaders.origin = `https://${event.headers.host}`;

    if (reqHeaders.host) {
      // Have to remove host if it is from the UI to avoid incorrect host being set when sending to Cognito
      // (Should be API GW host, not UI)
      delete reqHeaders.host;
    }
    reqHeaders = _.omitBy(reqHeaders, _.isNil);
  }

  if (event.body && event.body!.length !== 0) {
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      body = event.body;
    }
  }
  if (event.queryStringParameters) {
    params = event.queryStringParameters;
  } else if (event.multiValueQueryStringParameters) {
    // Due to multiValueHeaders, queryStringParameters become multiValueQueryStringParameters
    // with each value wrapped in an array
    params = {};
    Object.keys(event.multiValueQueryStringParameters).forEach((key) => {
      // eslint-disable-next-line security/detect-object-injection
      params[decodeURIComponent(key)] = decodeURIComponent(event.multiValueQueryStringParameters[key][0]);
    });
  }

  function setupResponse(
    response: {
      statusCode: number;
      statusDescription: string;
      body: unknown;
      isBase64Encoded: boolean;
      multiValueHeaders: Record<string, Array<unknown>>;
      headers: Record<string, unknown>;
      cookies?: Array<string>;
    },
    data: unknown,
    status: number,
    statusText: string,
    headers: Record<string, unknown>
  ): void {
    if (headers['set-cookie']) {
      if (Array.isArray(headers['set-cookie'])) {
        response.multiValueHeaders['set-cookie'] = headers['set-cookie'];
      } else {
        response.multiValueHeaders['set-cookie'] = [headers['set-cookie']];
      }
      response.headers['set-cookie'] = headers['set-cookie'];
    }
    response.statusCode = status;
    response.statusDescription = statusText;
    if (data) {
      response.body = JSON.stringify(data);
    }
  }

  try {
    if (HTTP_METHOD === 'GET') {
      const { data, status, statusText, headers } = await axios.get(targetPath, {
        headers: reqHeaders,
        params,
        withCredentials: true
      });
      setupResponse(response, data, status, statusText, headers);
    }

    if (HTTP_METHOD === 'PATCH') {
      const { data, status, statusText, headers } = await axios.patch(targetPath, body, {
        headers: reqHeaders,
        params,
        withCredentials: true
      });
      setupResponse(response, data, status, statusText, headers);
    }

    if (HTTP_METHOD === 'POST') {
      const { data, status, statusText, headers } = await axios.post(targetPath, body, {
        headers: reqHeaders,
        params,
        withCredentials: true
      });
      setupResponse(response, data, status, statusText, headers);
    }

    if (HTTP_METHOD === 'PUT') {
      const { data, status, statusText, headers } = await axios.put(targetPath, body, {
        headers: reqHeaders,
        params,
        withCredentials: true
      });
      setupResponse(response, data, status, statusText, headers);
    }

    if (HTTP_METHOD === 'DELETE') {
      const { data, status, statusText, headers } = await axios.delete(targetPath, {
        headers: reqHeaders,
        params,
        withCredentials: true
      });
      setupResponse(response, data, status, statusText, headers);
    }
  } catch (err) {
    if (!(err instanceof AxiosError) || !err.response) {
      console.error(`Unsupported error encountered: ${JSON.stringify(err)}`);
      throw err;
    }

    const error = new HttpError(
      err.response!.status,
      JSON.stringify({
        error: err.response!.data.error,
        message: err.response!.data.message
      }),
      err.response!.statusText
    );

    error.isBase64Encoded = false;
    error.headers = { 'Content-Type': 'application/json' };

    console.error('Application error encountered', error);

    // The error object has to be returned like this for integration tests' backwards compatibility
    return error;
  }

  return response;
}
