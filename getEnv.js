'use strict'

const fs = require('fs');

const dotEnvExists = fs.existsSync('.env');
if (dotEnvExists) {
    console.log('getEnv.js: .env exists');
    process.exit();
}

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const bucketName = `envvars-discordbots`;
console.log(`Downloading .env from bucket "${bucketName}"`);
storage
    .bucket(bucketName)
    .file('.env')
    .download({ destination: '.env' })
    .then(() => {
        console.info('getEnv.js: .env downloaded successfully');
    })
    .catch(err => {
        console.error(`getEnv.js: There was an error: ${JSON.stringify(err, undefined, 2)}`);
    });