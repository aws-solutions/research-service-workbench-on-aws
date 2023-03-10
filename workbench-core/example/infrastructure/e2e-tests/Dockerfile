FROM cypress/included:12.7.0

# should print Cypress version
# plus Electron and bundled Node versions
RUN echo  " node version:    $(node -v) \n" \
  "npm version:     $(npm -v) \n" \
  "yarn version:    $(yarn -v) \n" \
  "debian version:  $(cat /etc/debian_version) \n" \
  "user:            $(whoami) \n" \
  "chrome:          $(google-chrome --version || true) \n" \
  "firefox:         $(firefox --version || true) \n"

WORKDIR /tmp
COPY cypress/ cypress/
COPY cypress.config.js .

ENTRYPOINT ["cypress", "run", "--config", "baseUrl=https://example-app-domain-155208731242-us-east-1.auth.us-east-1.amazoncognito.com/login?client_id=5l3lr5v12gbk0ollb2sc7c0o8r&response_type=code&scope=openid&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F"]


