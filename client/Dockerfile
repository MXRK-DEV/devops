FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

# 👇 Add ARG and ENV for VITE_API_URL
ARG VITE_API_URL=http://backend:3000
ENV VITE_API_URL=${VITE_API_URL}

COPY . .

RUN npm run build

EXPOSE 5173

CMD [ "npm", "run", "preview" ]