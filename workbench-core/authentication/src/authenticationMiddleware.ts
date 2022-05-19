import { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from './authenticationService';

// TODO send message with res.sendStatus?

export function login(
  authenticationService: AuthenticationService
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const code = req.query.code;
    if (code) {
      try {
        const { idToken, accessToken, refreshToken, expiresIn } =
          await authenticationService.handleAuthorizationCode(code as string);

        // set cookies.
        res.cookie('id_token', idToken, { httpOnly: true, secure: true, maxAge: expiresIn * 1000 });
        res.cookie('access_token', accessToken, { httpOnly: true, secure: true, maxAge: expiresIn * 1000 });
        res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: true, maxAge: expiresIn * 1000 });

        res.sendStatus(200);
      } catch (error) {
        // TODO error handling
        res.sendStatus(401);
      }
    } else {
      res.redirect(authenticationService.getAuthorizationCodeUrl());
    }
  };
}

// TODO add logout, get new access token from refresh token functions

export function authenticationMiddleware(
  authenticationService: AuthenticationService
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async function (req: Request, res: Response, next: NextFunction) {
    const { cookies } = req;

    if (cookies.access_token) {
      try {
        const decodedAccessToken = await authenticationService.validateToken(cookies.access_token);

        // TODO wrap both of these into a getUserFromToken() call that returns the AuthenticatedUser object
        const id = authenticationService.getUserIdFromToken(decodedAccessToken);
        const roles = authenticationService.getUserRolesFromToken(decodedAccessToken);

        // TODO res.locals.user = return value from above change
        res.locals.user = {
          id,
          roles
        };

        next();
      } catch (error) {
        // TODO error handling
        res.sendStatus(401);
      }
    } else {
      // TODO error handling
      res.sendStatus(401);
    }
  };
}
