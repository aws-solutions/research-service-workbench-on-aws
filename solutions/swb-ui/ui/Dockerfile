FROM node:16-alpine

ARG BRANCH='main'
ARG STAGE
ARG API_URL

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN git clone https://github.com/aws-solutions/solution-spark-on-aws.git

WORKDIR '/solution-spark-on-aws'
ENV STAGE=$STAGE
ENV NEXT_PUBLIC_API_BASE_URL=$API_URL

RUN git checkout $BRANCH
RUN node common/scripts/install-run-rush.js install
RUN node common/scripts/install-run-rush.js build

WORKDIR '/solution-spark-on-aws/solutions/swb-ui/ui'

EXPOSE 3000

ENV PORT 3000

CMD ["node", "../../../common/scripts/install-run-rushx.js", "start"]

