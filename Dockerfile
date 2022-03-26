FROM frolvlad/alpine-glibc

ENV CURL_VERSION=7.80.0-r0
ENV ZIP_VERSION=3.0-r9
ENV GIT_VERSION=2.34.1-r0
ENV BASH_VERSION=5.1.16-r0
ENV JQ_VERSION=1.6-r1
ENV NODEJS_VERSION=16.14.2-r0
ENV NPM_VERSION=8.1.3-r0

RUN apk update \
    && apk upgrade -U -a

RUN apk add --no-cache curl=${CURL_VERSION} zip=${ZIP_VERSION} git=${GIT_VERSION} \
        bash=${BASH_VERSION} jq=${JQ_VERSION} nodejs=${NODEJS_VERSION} npm=${NPM_VERSION} && \
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
        unzip awscliv2.zip && \
        ./aws/install

RUN rm -rf /var/cache/apk/*