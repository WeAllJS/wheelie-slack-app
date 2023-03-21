FROM node:19

WORKDIR /work
ADD package.json package-lock.json /work/
ADD vendor /work/vendor
RUN npm install
ADD server.js /work/
ADD lib /work/lib
ENTRYPOINT [ "npm", "start" ]
