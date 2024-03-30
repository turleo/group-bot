FROM python:3.11.4-slim as build


WORKDIR /code

RUN apt update
RUN apt install --no-install-recommends -y build-essential libzbar-dev python3-dev
COPY requirements.txt .
RUN pip wheel -r requirements.txt

FROM python:3.11.4-slim
WORKDIR /code
RUN apt update
RUN apt install --no-install-recommends -y libzbar0 git
COPY --from=build /code /code 
RUN sh -c "pip install *.whl"
COPY . .
CMD python -m groupbot
