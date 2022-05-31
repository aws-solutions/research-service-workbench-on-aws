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

    if (typeof code === 'string' && typeof codeVerifier === 'string') {
      try {
        const { idToken, accessToken, refreshToken } = await authenticationService.handleAuthorizationCode(
          code,
          codeVerifier
        );

        const now = Date.now();

        // set cookies.
        res.cookie('access_token', accessToken.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          expires: accessToken.expiresIn ? new Date(now + accessToken.expiresIn * 1000) : undefined
        });
        if (refreshToken) {
          res.cookie('refresh_token', refreshToken.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expires: refreshToken.expiresIn ? new Date(now + refreshToken.expiresIn * 1000) : undefined
          });
        }

        res.status(200).json({ idToken: idToken.token });
      } catch (error) {
        res.sendStatus(401);
      }
    } else {
      res.sendStatus(400);
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
    const stateVerifier = req.query.stateVerifier;
    const codeChallenge = req.query.codeChallenge;
    if (typeof stateVerifier === 'string' && typeof codeChallenge === 'string') {
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
    const accessToken = req.cookies.access_token;

    if (typeof accessToken === 'string') {
      try {
        const decodedAccessToken = await authenticationService.validateToken(accessToken);

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
    const refreshToken = req.cookies.refresh_token;

    if (typeof refreshToken === 'string') {
      try {
        await authenticationService.revokeToken(refreshToken);
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
    const refreshToken = req.cookies.refresh_token;

    if (typeof refreshToken === 'string') {
      try {
        const { idToken, accessToken } = await authenticationService.refreshAccessToken(refreshToken);

        // set access cookie
        res.cookie('access_token', accessToken.token, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          expires: accessToken.expiresIn ? new Date(Date.now() + accessToken.expiresIn * 1000) : undefined
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
