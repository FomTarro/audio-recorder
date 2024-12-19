const http = require('http');
const path = require('path');
const express = require('express');
const fileUpload = require('express-fileupload')
const { PostToS3 } = require('./aws.client');
const app = express();
require('dotenv').config();

async function launch(){
    const port = process.env.PORT || 8080;;
    const baseDirectory = path.join(__dirname, './public');
    app.use('/', express.static(baseDirectory));
    app.set('trust proxy', true);
    app.use(fileUpload())
    app.post(['/upload',], async (req, res) => {
        if(req.files){
            const uploadedFile = Object.values(req.files)[0];
            if(uploadedFile){
                PostToS3({
                    name: uploadedFile.name,
                    file: uploadedFile.data,
                });
                res.status(200).send();
                return;
            }
        }
        res.status(400).send();
        return;
    });

    // Makes an http server out of the express server
    const httpServer = http.createServer(app);

    // Starts the http server
    httpServer.listen(port, () => {
        // code to execute when the server successfully starts
        console.log(`started on ${port}`);
    });
}

launch();