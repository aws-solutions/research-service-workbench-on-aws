/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

interface Props {
  children: JSX.Element;
}

/**
 * Redirects users to the login/home page if no authenticated user is logged in.
 * @param children - Elements to be displayed if user is authenticated.
 * @returns children Elements
 */
function RouteGuard({ children }: Props): JSX.Element {
  // TODO: Once accessToken cookie is properly set, change to check isLoggedIn to drive redirect
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('idToken');
    if (!token) {
      window.location.assign(window.location.origin);
    }
  }

  return children;
}

export default RouteGuard;
