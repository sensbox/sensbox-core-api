FROM node:lts
WORKDIR /srv/node-scripts/

# Install mongo functionalities
RUN wget -qO - http://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add - &&\
    echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.2.list &&\
    apt-get update &&\
    apt-get install -y mongodb-org-tools

# Bundle APP files
COPY package.json .
# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install
# Expose the listening port of your app
EXPOSE ${PORT}

CMD [ "npm", "run", "dev" ]
