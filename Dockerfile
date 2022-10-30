FROM public.ecr.aws/bitnami/node:16

ARG BRANCH='main'
RUN git clone https://github.com/aws-solutions/solution-spark-on-aws.git
RUN cd solution-spark-on-aws && git checkout $BRANCH
RUN cd solution-spark-on-aws && node common/scripts/install-run-rush.js install
RUN cd solution-spark-on-aws && node common/scripts/install-run-rush.js build -t @aws/swb-ui -v
