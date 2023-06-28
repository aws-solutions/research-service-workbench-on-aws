#!/bin/bash

environment=$(curl --location "https://$swbDomainName/api/projects/$projectId/environments" \
--header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header "Content-Type: application/json" \
--data "{
    \"description\": \"test 123\",
    \"name\": \"testEnvironment\",
    \"envTypeId\": \"$envTypeId\",
    \"envTypeConfigId\": \"$envTypeConfigId\",
    \"datasetIds\": [],
    \"envType\": \"sagemakerNotebook\"
}")
echo $environment