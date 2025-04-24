FROM node:18.20.8-slim
 
WORKDIR /app
 
COPY package*.json ./
 
RUN yarn install
 
COPY . .
 
EXPOSE 3000
 
RUN yarn build
CMD ["yarn", "start"]