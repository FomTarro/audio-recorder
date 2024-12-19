const AWS = require('aws-sdk');
require('dotenv').config();

function postToS3(fileData){
    // Set the region and access keys
    AWS.config.update({
        region: process.env.aws_bucket_region,
        accessKeyId: process.env.aws_client_id,
        secretAccessKey: process.env.aws_client_secret
    });

    // Create a new instance of the S3 class
    const s3 = new AWS.S3();

    // Set the parameters for the file you want to upload
    const params = {
        Bucket: process.env.aws_bucket_name,
        Key: fileData.name,
        Body: fileData.file
    };

    // Upload the file to S3
    s3.upload(params, (err, data) => {
        if (err) {
            console.log('Error uploading file:', err);
            // reject
        } else {
            console.log('File uploaded successfully. File location:', data.Location);
            // resolve
        }
    });
}

module.exports.PostToS3 = postToS3;