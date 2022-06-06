import { Action } from './action';
/**
 * The operation a {@link User} wants to perform.
 */
export default interface Operation {
  /**
   * The {@link Action} a {@link User} wants to perform.
   */
  action: Action;

  /**
   * The subject that the {@link Action} acts on.
   */
  subject: string;

  /**
   * The field a {@link User} wants access to.
   */
  field?: string;
}
