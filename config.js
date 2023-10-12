'use strict';

require('dotenv').config({path: __dirname + '/.env'});

module.exports = {
	SECRET : process.env.SECRET,
	PORT : process.env.PORT,
	MONGO_URI: process.env.MONGO_URI,
	NODE_ENV: process.env.NODE_ENV,
	DEV_URL : process.env.DEV_URL,
	PROD_URL : process.env.PROD_URL,
	PROJECT_DIR: __dirname,
	LOGGER: true,
	CLUSTERING: false,
	TOKEN_SECRET: process.env.TOKEN_SECRET,
	MAIL: {
		EMAIL_ID: process.env.EMAIL_ID,
		EMAIL_PWD: process.env.EMAIL_PWD
	},
	DEV_AWSURL : process.env.DEV_AWSURL,
	DEV_BUCKET: process.env.DEV_BUCKET_NAME,
	DEV_S3STORAGE : {
		accessKeyId: process.env.DEV_ACCESSKEY_ID,
    	secretAccessKey: process.env.DEV_SECRET_ACCESSKEY,
    	Bucket: process.env.DEV_BUCKET_NAME
	},
	API_KEY : process.env.API_KEY,
	SENDER_ID : process.env.SENDER_ID,
	ROUTE_NO : process.env.ROUTE_NO
}