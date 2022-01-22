FROM node:14.17.5 AS ui-build
WORKDIR /usr/src/app
COPY ytbdl-frontend/ ./ytbdl-frontend/
RUN cd ytbdl-frontend && npm install && npm run build

FROM beevelop/nodejs-python AS server-build
WORKDIR /root/
COPY --from=ui-build /usr/src/app/ytbdl-frontend/dist ./ytbdl-frontend/dist
COPY api/package*.json ./api/
RUN cd api && npm install   
RUN npm i -g ts-node
COPY api/*.ts ./api/
COPY api/yt-dlp ./api/
RUN ["chmod", "+x", "./api/yt-dlp"]
RUN apt-get update
RUN apt-get install ffmpeg -y
EXPOSE 3080

CMD ["ts-node", "./api/index.ts"]