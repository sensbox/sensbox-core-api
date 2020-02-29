FROM circleci/node:12
LABEL com.circleci.preserve-entrypoint=true

RUN sudo apt-get install gnupg \
    && sudo wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add - \
    && sudo echo "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/4.2 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list \
    && sudo apt-get update \
    && sudo apt-get install -y mongodb-org

RUN sudo mkdir -p /data/db \
    && sudo chmod -R a+wxr /data \
    && sudo chown -R $USER:$USER /data

EXPOSE 27017
CMD ["mongod"]






