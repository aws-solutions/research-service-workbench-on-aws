export default interface EnvironmentConnectionLinkPlaceholder {
  type: 'link';
  hrefKey: string; // key value should be returned from `environmentConnectionService.getAuthCreds()`. The link will direct users to the URL defined at `hrefKey`
  text: string; // text value of the link as displayed to the user
}
