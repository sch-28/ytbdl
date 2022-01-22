import * as bodyParser from "body-parser";
import express from 'express';
import * as service from './service'
var serveStatic = require('serve-static');
const path = require('path');
class App {

    public express: express.Application;


    constructor() {
        this.express = express();
        this.express.use(serveStatic(path.join(__dirname,"../ytbdl-frontend/dist")));
        this.middleware();
        this.routes();
    }

    // Configure Express middleware.
    private middleware(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    private routes(): void {

        /* this.express.get("/", (req, res, next) => {
           // res.sendFile(path.join(__dirname, "../ytbdl-frontend/dist/index.html"));
        }); */

        this.express.post("/api/info", async (req,res,next) => {
            const url = req.body.url;
            const results = await service.getInfo(url);
            res.json(results);
        })

        this.express.get("/api/download",async (req,res,next) => {
            if(!(req.query && req.query.video && req.query.audio && req.query.start && req.query.duration && req.query.title))
                return;
            const video = decodeURIComponent(req.query.video.toString());
            const audio = decodeURIComponent(req.query.audio.toString());
            const start = req.query.start.toString();
            const duration = req.query.duration.toString();
            const title = req.query.title.toString();
            service.downloadVideo(video,audio,start,duration,title,res)
        })

        // user route

        // handle undefined routes
/*         this.express.use("*", (req, res, next) => {
            res.send("Make sure url is correct!!!");
        }); */
    }
}

export default new App().express;