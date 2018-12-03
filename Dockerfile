FROM node:lts

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY . .
RUN npm install
RUN npm install -g react-scripts@2.1.0
RUN cd client && npm install && npm run build

EXPOSE 3001
CMD [ "node", "server.js" ]