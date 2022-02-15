'use strict'

const fs = require('fs');
const path = require('path');
const cwd = path.join(__dirname, '..');

const dotEnvExists = fs.existsSync('.env');
if (dotEnvExists) {
    console.log('getEnv.js: .env exists');
    process.exit();
}

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const bucketName = `envvars-discordbots`;
const fileName = '.env';
const destFileName = path.join(cwd, '.env');

async function downloadFile() {
    const options = {
        destination: destFileName,
    };

    await storage.bucket(bucketName).file(fileName).download(options);
    console.log(`gs://${bucketName}/${fileName} downloaded to ${destFileName}`);
}

console.log(`Downloading .env from bucket "${bucketName}"`);
downloadFile().catch(console.error);