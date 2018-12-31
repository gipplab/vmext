FROM node:8

RUN mkdir /opt/service
ADD . /opt/service
WORKDIR /opt/service
ENV HOME=/root

RUN npm install && npm dedupe
ENV IN_DOCKER=1

EXPOSE 4001
CMD npm start
