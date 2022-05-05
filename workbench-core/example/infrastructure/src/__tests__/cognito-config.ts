/**
 *
 * One time test user creation:
 * aws cognito-idp sign-up --client-id "*********" --username "*******" --password "********"
 *
 * One time user signup as an admin:
 * aws cognito-idp admin-confirm-sign-up --user-pool-id "********" --username "*******"
 *
 */
export const data = {
  AuthParameters: {
    USERNAME: process.env.COGNITO_USERNAME,
    PASSWORD: process.env.COGNITO_PASSWORD
  },
  AuthFlow: 'USER_PASSWORD_AUTH',
  ClientId: process.env.COGNITO_CLIENT_ID
};
