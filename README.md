# sensbox-core-api

## Core API Services

The core api services is a set of microservices that provide all the backend/core functionalities of the sensbox suite; In union with the dashboard allow manage all the information. 
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