/**
 * A record to represent a user.
 */
export interface User {
  /**
   * A unique identifier for the user.
   */
  uid: string;

  /**
   * The user's first name.
   */
  firstName: string;

  /**
   * The user's last name.
   */
  lastName: string;

  /**
   * The user's email address.
   */
  email: string;

  /**
   * The roles to which the user belongs.
   */
  roles: string[];
}
