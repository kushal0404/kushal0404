FROM node:14-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY api/ /app/api
COPY common/ /app/common
COPY config/ /app/config
COPY src/ /app/src

COPY route.cjs ./

ENTRYPOINT [ "node", "route.cjs" ]

# docker build -f Dockerfile -t {{image name}}} .

