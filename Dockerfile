FROM public.ecr.aws/bitnami/node:16

ARG BRANCH='main'
RUN git clone https://github.com/aws-solutions/solution-spark-on-aws.git

WORKDIR '/app/solution-spark-on-aws'

RUN git checkout $BRANCH
RUN node common/scripts/install-run-rush.js install
RUN node common/scripts/install-run-rush.js build -t @aws/swb-ui -v

EXPOSE 3000

ENV PORT 3000

WORKDIR '/app/solution-spark-on-aws/solutions/swb-ui'
CMD ["node", "../../common/scripts/install-run-rushx.js", "start"]
