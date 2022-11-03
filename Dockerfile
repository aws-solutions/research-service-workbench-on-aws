FROM node:16-alpine

ARG BRANCH='main'

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

RUN git clone https://github.com/aws-solutions/solution-spark-on-aws.git

WORKDIR '/solution-spark-on-aws'
ENV STAGE=$STAGE

RUN git checkout $BRANCH
RUN node common/scripts/install-run-rush.js install
RUN node common/scripts/install-run-rush.js build

EXPOSE 3000

ENV PORT 3000

WORKDIR '/app/solution-spark-on-aws/solutions/swb-ui'
CMD ["node", "../../common/scripts/install-run-rushx.js", "start"]
