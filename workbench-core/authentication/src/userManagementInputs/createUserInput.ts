import { User } from '../user';
/**
 * Input for createUser.
 */
export interface CreateUserInput {
  /**
   * The details of the {@link User} to create.
   */
  user: User;
}
