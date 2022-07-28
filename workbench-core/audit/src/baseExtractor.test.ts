/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '@amzn/workbench-core-authorization';
import { Request, Response } from 'express';
import { BaseExtractor } from './baseExtractor';
import { Extractor } from './extractor';
import Metadata from './metadata';

describe('BaseExtractor', () => {
  const baseExtractor: Extractor = BaseExtractor;
  const mockMethod = 'GET';
  const mockUrl = '/sample';
  const sampleIp = 'sampleIP';
  const mockUser: AuthenticatedUser = {
    id: 'sampleId',
    roles: []
  };

  test('getMetadata with IP from x-forwarded-for, AuthenticatedUser, method, and path', () => {
    const res: Response = {
      locals: {
        user: mockUser
      }
    } as unknown as Response;
    const req: Request = {
      headers: {
        'x-forwarded-for': sampleIp
      },
      method: mockMethod,
      originalUrl: mockUrl
    } as unknown as Request;
    const metadata: Metadata = baseExtractor.getMetadata(req, res);

    expect(metadata.action).toStrictEqual('GET /sample');
    expect(metadata.source).toStrictEqual({
      ip: sampleIp
    });
    expect(metadata.actor).toStrictEqual({
      uid: mockUser.id
    });
  });

  test('getMetadata with IP from remoteAddress, AuthenticatedUser, method, and path', () => {
    const res: Response = {
      locals: {
        user: mockUser
      }
    } as unknown as Response;
    const req: Request = {
      socket: {
        remoteAddress: sampleIp
      },
      headers: {},
      method: mockMethod,
      originalUrl: mockUrl
    } as unknown as Request;
    const metadata: Metadata = baseExtractor.getMetadata(req, res);

    expect(metadata.action).toStrictEqual('GET /sample');
    expect(metadata.source).toStrictEqual({
      ip: sampleIp
    });
    expect(metadata.actor).toStrictEqual({
      uid: mockUser.id
    });
  });

  test('getMetadata with no user should throw error', () => {
    const res: Response = {
      locals: {}
    } as unknown as Response;
    const req: Request = {
      socket: {
        remoteAddress: sampleIp
      },
      headers: {},
      method: mockMethod,
      originalUrl: mockUrl
    } as unknown as Request;
    try {
      baseExtractor.getMetadata(req, res);
      expect.hasAssertions();
    } catch (err) {
      expect(err.message).toBe('Error extracting metadata');
    }
  });
});
