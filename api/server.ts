import * as bodyParser from "body-parser";
import express from "express";
import * as service from "./service";
var serveStatic = require("serve-static");
const path = require("path");
class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.express.use(
      serveStatic(path.join(__dirname, "../ytbdl-frontend/dist"))
    );
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

    this.express.post("/api/info", async (req, res, next) => {
      const url = req.body.url;
      const results = await service.getInfo(url);
      res.json(results);
    });

    this.express.get("/api/download", async (req, res, next) => {
      if (!(req.query && req.query.video && req.query.title)) return;

      let video = "";
      let audio = "";
      let start = "";
      let duration = "";
      let title = "";
      video = decodeURIComponent(req.query.video.toString());
      if (req.query.audio)
        audio = decodeURIComponent(req.query.audio.toString());
      if (req.query.start) start = req.query.start.toString();
      if (req.query.duration) duration = req.query.duration.toString();
      title = req.query.title.toString().replace(/[^a-zA-Z 0-9]/g, "");
      service.downloadVideo(video, audio, start, duration, title, res);
    });

    // user route

    // handle undefined routes
    /*         this.express.use("*", (req, res, next) => {
            res.send("Make sure url is correct!!!");
        }); */
  }
}

export default new App().express;
