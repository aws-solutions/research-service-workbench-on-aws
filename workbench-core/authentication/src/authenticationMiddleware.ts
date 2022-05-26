import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from './authenticatedUser';
import { AuthenticationService } from './authenticationService';

// TODO send error message with status code?
// TODO log errors?

// TODO add to doc
// requires use of cookieParser and bodyParser middlewares
// app.use(cookieParser());
// app.use(express.json());

/**
 * An Express middleware function used to exchange the authorization code received from the authentication server for authentication tokens.
 * This route places the access token and refresh token, if it exists, into http only, secure, same site strict cookies and returns the id token
 * in the response body.
 *
 * This function assumes:
 *  - a request body parameter named `code` that holds the authorization code
 *  - a request body parameter named `codeVerifier` that holds a pkce code verififier value
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @returns the middleware function
 *
 * @example
 * ```
 * app.get('tokens', getTokensFromAuthorizationCode(authenticationService));
 * ```
 */
export function getTokensFromAuthorizationCode(
  authenticationService: AuthenticationService
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const code = req.body.code;
    const codeVerifier = req.body.codeVerifier;

    if (code && codeVerifier) {
      try {
        const { idToken, accessToken, refreshToken } = await authenticationService.handleAuthorizationCode(
          code,
          codeVerifier
        );

        // set cookies.
        res.cookie('access_token', accessToken.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: accessToken.expiresIn * 1000
        });
        if (refreshToken) {
          res.cookie('refresh_token', refreshToken.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: refreshToken.expiresIn * 1000
          });
        }

        res.status(200).json({ idToken: idToken.token });
      } catch (error) {
        res.sendStatus(401);
      }
    } else {
      res.sendStatus(401);
    }
  };
}

/**
 * An Express middleware function used to get the url to the authentication hosted UI.
 * The `stateVerifier` and `codeChallenge` request query parameters are temporary values passed in by the client. The client will replace these values later
 * in order to keep them a client secret.
 *
 * This function assumes:
 *  - a request query parameter named `stateVerifier` that holds a temporary state value
 *  - a request query parameter named `codeChallenge` that holds a temporary pkce code challenge value
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @returns the middleware function
 *
 * @example
 * ```
 * app.get('codeUrl', getAuthorizationCodeUrl(authenticationService));
 * ```
 */
export function getAuthorizationCodeUrl(
  authenticationService: AuthenticationService
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const stateVerifier = req.query.stateVerifier as string;
    const codeChallenge = req.query.codeChallenge as string;
    if (stateVerifier && codeChallenge) {
      res
        .status(200)
        .json({ redirectUrl: authenticationService.getAuthorizationCodeUrl(stateVerifier, codeChallenge) });
    } else {
      res.sendStatus(400);
    }
  };
}

/**
 * An Express middleware function used to authenticate a user from its access token.
 * If authenticated, the user's id and roles will be stored in `res.locals.user`
 *
 * This function assumes:
 *  - the access token is stored in a cookie named `access_token`
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @returns the middleware function
 *
 * @example
 * ```
 * app.get('protectedRoute', verifyToken(authenticationService), ...other_middleware);
 * ```
 */
export function verifyToken(
  authenticationService: AuthenticationService
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async function (req: Request, res: Response, next: NextFunction) {
    const { cookies } = req;

    if (cookies.access_token) {
      try {
        const decodedAccessToken = await authenticationService.validateToken(cookies.access_token);

        const user: AuthenticatedUser = {
          id: authenticationService.getUserIdFromToken(decodedAccessToken),
          roles: authenticationService.getUserRolesFromToken(decodedAccessToken)
        };

        res.locals.user = user;

        next();
      } catch (error) {
        res.sendStatus(401);
      }
    } else {
      res.sendStatus(401);
    }
  };
}

/**
 * An Express middleware function used to logout a user.
 *
 * This function assumes:
 *  - the access token is stored in a cookie named `access_token`
 *  - if there is a refresh token, it is stored in a cookie named `refresh_token`
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @returns the middleware function
 *
 * @example
 * ```
 * app.get('logout', logoutUser(authenticationService));
 * ```
 */
export function logoutUser(
  authenticationService: AuthenticationService
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const { cookies } = req;

    if (cookies.refresh_token) {
      try {
        await authenticationService.revokeToken(cookies.refresh_token);
      } catch (error) {
        // token could not be revoked for some reason.
        // Log reason but don't interrupt logout
        console.log(error); // TODO replace with logging service?
      }
    }

    res.cookie('access_token', 'cleared', { expires: new Date(0) });
    res.cookie('refresh_token', 'cleared', { expires: new Date(0) });

    res.sendStatus(200);
  };
}

/**
 * An Express middleware function used to refresh an expired access code.
 *
 * This function assumes:
 *  - the access token is stored in a cookie named `access_token`.
 *
 * @param authenticationService - a configured {@link AuthenticationService} instance
 * @returns the middleware function
 *
 * @example
 * ```
 * app.get('refresh', refreshAccessToken(authenticationService));
 * ```
 */
export function refreshAccessToken(
  authenticationService: AuthenticationService
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const { cookies } = req;

    if (cookies.refresh_token) {
      try {
        const { idToken, accessToken } = await authenticationService.refreshAccessToken(
          cookies.refresh_token
        );

        // set access cookie
        res.cookie('access_token', accessToken.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: accessToken.expiresIn * 1000
        });

        res.status(200).json({ idToken: idToken.token });
      } catch (error) {
        // token could not be refreshed for some reason
        console.log(error); // TODO replace with logging service?
        res.sendStatus(401);
      }
    } else {
      // refresh token expired, must login again
      res.sendStatus(401);
    }
  };
}
