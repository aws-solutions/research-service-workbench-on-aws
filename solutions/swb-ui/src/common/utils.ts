export const nameRegex = new RegExp('^[A-Za-z]{1}[A-Za-z0-9-]*$');

/* eslint-disable security/detect-unsafe-regex */
export const cidrRegex = new RegExp(
  '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])[.]){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(/(3[0-2]|[1-2][0-9]|[0-9]))$'
);
