FROM oven/bun:alpine

ARG COMMIT_HASH=unknown
ENV COMMIT_HASH=$COMMIT_HASH

RUN apk update
RUN apk add --no-cache ffmpeg

WORKDIR /code
COPY package.json ./ 
RUN bun install --production

COPY src/ src/
COPY modules/ modules/

CMD ["bun", "run", "run"]

