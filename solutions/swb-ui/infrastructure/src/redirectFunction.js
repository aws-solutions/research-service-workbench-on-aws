/***************************************************************************************************************************************************************************************
Cloudfront access objects in S3 Bucket as file path instead of web server routing
This function emulates a web server routing every time a request is made to the cloudfront by adding the necessary elements in the URL requested to be accessed as filepath in S3 Bucket.
e.g. 
/environments      => /environments/index.html
/environments/new  => /environments/new/index.html
/environments/     => /environments/index.html
/environments/new/ => /environments/new/index.html

Note: The modified URL will not be displayed in browser as it's only for communication between Cloudfront and S3 Bucket.
***************************************************************************************************************************************************************************************/
function handler(event) {
  var request = event.request;
  if (
    request.uri !== '/' &&
    (request.uri.endsWith('/') || request.uri.lastIndexOf('.') < request.uri.lastIndexOf('/'))
  ) {
    if (request.uri.endsWith('/')) {
      request.uri = request.uri.concat('index.html');
    } else {
      request.uri = request.uri.concat('/index.html');
    }
  }
  return request;
}
