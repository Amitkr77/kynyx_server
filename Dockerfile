FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm start
EXPOSE 5000
CMD ["node", "server.js"]