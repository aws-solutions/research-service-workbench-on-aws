FROM node:14.17-alpine

WORKDIR /app
COPY . .


RUN file="$(ls)" && echo $file
RUN npm install -g @microsoft/rush@5.62.1
# RUN npm install -g @rushstack/heft@^0.48.7
RUN npm install -g typescript@^4.5.2
# RUN node common/scripts/install-run-rush.js install
RUN npm install -g next
RUN rush update
RUN rush install
RUN rush build
RUN cd solutions/swb-ui

# EXPOSE 3000
# CMD [ "rushx", "start" ]