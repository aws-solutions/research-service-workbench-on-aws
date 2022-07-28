/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('./authorizationPlugin');
jest.mock('./permissionsPlugin');
import { fc, itProp } from 'jest-fast-check';
import { MockAuthorizationPlugin } from './__mocks__/authorizationPlugin';
import { MockPermissionsPlugin } from './__mocks__/permissionsPlugin';
import {
  AuthenticatedUser,
  AuthorizationPlugin,
  PermissionsPlugin,
  HTTPMethod,
  AuthorizationService
} from '.';

describe('Authorization Service', () => {
  let mockPermissionsPlugin: PermissionsPlugin;
  let mockAuthorizationPlugin: AuthorizationPlugin;
  let authorizationService: AuthorizationService;
  let mockAdmin: AuthenticatedUser;
  let mockGuest: AuthenticatedUser;
  let errorMessage: string;
  beforeEach(() => {
    errorMessage = 'Permission is not granted';
    mockAdmin = {
      id: 'sampleUID',
      roles: ['admin']
    };
    mockGuest = {
      id: 'sampleUID',
      roles: ['guest']
    };
    mockPermissionsPlugin = new MockPermissionsPlugin();
    mockAuthorizationPlugin = new MockAuthorizationPlugin();
    authorizationService = new AuthorizationService(mockAuthorizationPlugin, mockPermissionsPlugin);
  });

  describe('isAuthorized', () => {
    test('guest authorized to GET request on /sample', () => {
      const route: string = '/sample';
      const method: HTTPMethod = 'GET';
      expect(async () => {
        await authorizationService.isAuthorizedOnRoute(mockGuest, route, method);
      }).not.toThrowError();
    });
    test('guest not authorized to PUT request on /sample', async () => {
      const route: string = '/sample';
      const method: HTTPMethod = 'PUT';
      try {
        await authorizationService.isAuthorizedOnRoute(mockGuest, route, method);
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(`User is forbidden: ${errorMessage}`);
      }
    });
    test('admin is authorized to PUT request on /sample', async () => {
      const route: string = '/sample';
      const method: HTTPMethod = 'PUT';
      expect(async () => {
        await authorizationService.isAuthorizedOnRoute(mockAdmin, route, method);
      }).not.toThrowError();
    });
    itProp('random user input', [fc.anything()], async (user) => {
      const route: string = '/sample';
      const method: HTTPMethod = 'PUT';
      try {
        await authorizationService.isAuthorizedOnRoute(user as AuthenticatedUser, route, method);
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
    itProp('random route input', [fc.anything()], async (route) => {
      const method: HTTPMethod = 'PUT';
      try {
        await authorizationService.isAuthorizedOnRoute(mockAdmin, route as string, method);
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
    itProp('random method input', [fc.anything()], async (method) => {
      const route: string = '/sample';
      try {
        await authorizationService.isAuthorizedOnRoute(mockAdmin, route, method as HTTPMethod);
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });

  describe('isRouteIgnored', () => {
    test('GET /login should be ignored', async () => {
      expect(await authorizationService.isRouteIgnored('/login', 'GET')).toBe(true);
    });
    test('PUT /login should not be ignored', async () => {
      expect(await authorizationService.isRouteIgnored('/login', 'PUT')).toBe(false);
    });
  });
});
