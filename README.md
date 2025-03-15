# osu-cards-backend

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

Works together with the [osu-cards-frontend](https://github.com/otsosaarinen/osu-cards-frontend).

This backend handles database management and retrieves player data from an SQLite3 database when a request is made by the frontend. The database currently contains the data for the top 50 osu!standard players as of February 22, 2025.

# How to run
1. Create ```.env``` file to root directory and add your osu! api key and port to ```.env```. Frontend uses port 3000 for communicating with backend so using that is recommended unless you also change frontend port value
2. Run ```dist/server.js``` to start the express.js server
