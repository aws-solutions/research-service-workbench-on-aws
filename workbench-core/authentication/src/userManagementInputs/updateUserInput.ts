import { User } from '../user';
/**
 * Input for updateUser.
 */
export interface UpdateUserInput {
  /**
   * The ID of the user to update.
   */
  uid: string;
  /**
   * The new details for the {@link User}.
   */
  user: User;
}
