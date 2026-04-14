FROM oven/bun:alpine

RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg

WORKDIR /code
COPY package.json ./ 
RUN bun install --production

COPY src/ src/
COPY modules/ modules/

CMD ["bun", "run", "run"]

