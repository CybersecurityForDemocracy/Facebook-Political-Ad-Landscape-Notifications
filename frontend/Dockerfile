FROM ubuntu:bionic

ENV LANG C.UTF-8
ARG DEBIAN_FRONTEND=noninteractive
# Allow SECRET_KEY to be passed via arg so collectstatic can run during build time
ARG SECRET_KEY
ARG NODE_ENV
ARG PORT
ARG REACT_APP_POLADS_URL=${REACT_APP_POLADS_URL}
ARG REACT_APP_POLADS_API_TOKEN=${REACT_APP_POLADS_API_TOKEN}
ARG REACT_APP_EMAILJS_SERVICE_ID=${REACT_APP_EMAILJS_SERVICE_ID}
ARG REACT_APP_EMAILJS_TEMPLATE_ID=${REACT_APP_EMAILJS_TEMPLATE_ID}
ARG REACT_APP_EMAILJS_SIGNUP_TEMPLATE_ID=${REACT_APP_EMAILJS_SIGNUP_TEMPLATE_ID}
ARG REACT_APP_EMAILJS_USER_ID=${REACT_APP_EMAILJS_USER_ID}

RUN env
RUN apt-get update
# Requirements for nodejs and npm
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_lts.x | bash -

# libpq-dev and python3-dev help with psycopg2
RUN apt-get install -y python3.7-dev python3-pip libpq-dev nodejs \
  && apt-get clean all \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/webapp
COPY . .
RUN npm install && npm run build
RUN cd backend && pip3 install --no-cache-dir -q 'pipenv==2018.11.26' && pipenv install --deploy --system
RUN cd backend && python3 manage.py collectstatic --no-input

# Run the image as a non-root user
RUN adduser --disabled-password --gecos "" django
USER django

# Run the web server on port $PORT
CMD cd backend && waitress-serve --port=$PORT poladstransparency_17744.wsgi:application
