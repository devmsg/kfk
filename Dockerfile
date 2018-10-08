FROM node
COPY . /app
WORKDIR /app
RUN npm install yarn -g --registry=https://registry.npm.taobao.org
EXPOSE 3000