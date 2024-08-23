FROM oven/bun:alpine

WORKDIR /code
COPY package.json ./ 
COPY src/ src/
COPY modules/ modules/

RUN bun install

CMD ["bun", "run", "run"]

