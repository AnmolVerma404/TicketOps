FROM node:alpine

WORKDIR /app
COPY package.json .
# --only=prod is now --omit=dev, but --omit=dev is also not working
# Therefore I am trying to install doing production [found in ChatGPT]
# --omit=dev is working, it was not working as it's was first time I guess
RUN npm install --omit=dev 
COPY . .

CMD [ "npm","run","dev" ]
