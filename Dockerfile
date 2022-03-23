FROM node:14-alpine

RUN apk update \
    && apk upgrade -U -a \
    && apk --no-cache add python3 py3-pip git bash jq \
    && rm -rf /var/cache/apk/*
RUN pip3 install awscli