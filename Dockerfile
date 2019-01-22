FROM node:10-alpine

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install --ignore-scripts

RUN npm rebuild

COPY . .

RUN npm run-script prepare

EXPOSE 8080

CMD [ "npm", "start" ]