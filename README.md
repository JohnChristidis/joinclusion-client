# Joinclusion Client

Welcome to the Joinclusion Client repository! This repository contains the code for the client-side of the Joinclusion project.

## Requirements

Before you begin, ensure you have the following installed on your development machine:

- [Node.js](https://nodejs.org/) and npm (Node Package Manager)
- [nodemon](https://nodemon.io/) (for development)

## Getting Started

1. Clone this repository to your local machine:
   ```sh
   git clone https://github.com/your-username/joinclusion-client.git
   cd joinclusion-client
   npm install
   // change origin and port from server.js to your desired values
   const corsOptions = {
     origin: 'http://localhost:5173'
   };
   const PORT = 3000;
   // create an .env file and import the following with your values. e.g.

   PORT=3000
   DB_HOST=localhost
   DB_USER=username
   DB_PASSWORD=password
   DB_NAME=joinclusion

   ------> UPDATE <------
   In the .env add the following
   ENVIRONMENT=development
   LOCATION_KEY_FILE= your_key
   LOCATION_CERTIFICATE_FILE= your_certificate
   -------> END OF UPDATE <-------

   ------> UPDATE 14/11 <--------
   In the .env add the following
   ORIGIN=your_url
   Also change the following
   ENVIRONMENT=development
   to
   ENVIRONMENT=staging
   ------> END OF UPDATE <------

   nodemon server.js
