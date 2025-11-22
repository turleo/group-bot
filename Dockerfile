FROM oven/bun:alpine

WORKDIR /code
COPY package.json ./ 
RUN bun install

COPY src/ src/
COPY modules/ modules/

CMD ["bun", "run", "run"]

