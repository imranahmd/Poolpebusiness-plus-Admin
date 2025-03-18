FROM node:14.0.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production --silent

RUN npm install react-scripts@5.0.1 -g --silent

COPY . ./

EXPOSE 3000

CMD ["npm", "start"]
