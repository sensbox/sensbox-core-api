# sensbox-core-api

## Core API Services

The core api services are a set of microservices that provide all the backend / core functionalities of the sensbox suite; Along with the dashboard allow to manage all the information, metrics from devices, events, alerts, user's customized dashboards, etc.

Feel free to contribute with us :) 


The following is a list of the related microservices that compose the suite: 

    - sensbox-api: API to provide services to the dasboard. 
    - sensbox-mqtt: events queue services. 
    - sensbox-influxdb: DB to persist sensors' metrics. 
    - sensbox-mongodb: DB to persist gral data, mainly from the dashboard. 
    - sensbox-redis: cache service. 
    
    - sensbox-dashboad: UI that allow manage: Users, Organizations, Devices, etc.

## Prerequisites:
    -docker
    -docker-compose

## Installation:

1. create a main folder which will contain all the needed microservices.

    ```sh
    mkdir sensbox && cd sensbox
    ```
2. clone the required repos:
    ```sh 
    git clone https://github.com/santiagosemhan/sensbox-core-api.git
    ```
    ```sh 
    git clone https://github.com/santiagosemhan/sensbox-dashboard.git
    ```
3. copy the docker-compose.yml file to the root folder

4. run the command:
    ```sh
    docker-compose up 
    ```
5. enjoy the Sensbox Suite.

## Import/Export Database
- to Create a backup of the Mongo Database you can run the following script:

    ```
    npm run exportDB
    ```
    this command will create a dump for the entire database under the backups folder, named as a timestamp.

- to **Restore** the Mongo Database from a backup file, put the file under the **backups** directory then run the follow command:

    ```
    npm run importDB <filename> 
    ```

    this command automatically will restore the sensbox database.

