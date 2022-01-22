import * as cProcess from "child_process";
const util = require("util");
const exec = util.promisify(cProcess.exec);
import Ffmpeg, * as ffmpeg from "fluent-ffmpeg";
import express from "express";
import * as fs from "fs";
//const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
//console.log(ffmpegPath)
//ffmpeg.setFfmpegPath(ffmpegPath);

export async function downloadVideo(
  video: string,
  audio: string,
  start: string,
  duration: string,
  title: string,
  res: express.Response
) {
  res.setHeader("Content-type", "video/mp4");
  if(start != "" && duration != "")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${title}-Clip:${start}:${+start + +duration}.mp4`
  );
  else
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${title}-Clip.mp4`
  );
  console.log(new Date().toLocaleString())
  console.log(video)
  console.log(audio)
  if(video != "" && audio != "" && start != "" && duration != "") //youtube
  ffmpeg
    .default()
    .addInput(video)
    .setStartTime(start)
    .addInput(audio)
    .setStartTime(start)
    .duration(duration)
    .on("error", logError)
    .addOption('-preset veryfast')
    .outputOptions(['-f mp4','-movflags frag_keyframe+empty_moov', '-crf 35'])
    .output(res, { end: true })
    .run();
    else if(video != "" && audio == "" && start != "" && duration != "") //twitter
    ffmpeg
    .default()
    .addInput(video)
    .setStartTime(start)
    .duration(duration)
    .on("error", logError)
    .addOption('-preset veryfast')
    .outputOptions(['-f mp4','-movflags frag_keyframe+empty_moov', '-crf 30'])
    .output(res, { end: true })
    .run();
    else if(video != "" && audio == "" && start == "" && duration == "") //insta
    ffmpeg
    .default()
    .addInput(video)
    .on("error", logError)
    .addOption('-preset veryfast')
    .outputOptions(['-f mp4','-movflags frag_keyframe+empty_moov', '-crf 30'])
    .output(res, { end: true })
    .run();
}

function logError(err:any, stdout:any, stderr:any){
    if (err) {
        console.log("ERROR AT " + new Date().toLocaleString())
        console.log(err)
        console.log("stdout:\n" + stdout);
        console.log("stderr:\n" + stderr);
      }
}

function fixDuration(duration: string): string {
  const timeString = duration.split(":");
  let time = duration;
  if (timeString.length == 1) {
    time = `00:00:${duration.length > 1 ? duration : "0" + duration}`;
  } else if (timeString.length == 2) {
    time = `00:${timeString[0].length > 1 ? duration : "0" + duration}`;
  }
  return time;
}

export async function getInfo(url: string) {
  //const reply = (await exec(`.\\yt-dlp.exe -g --get-duration --get-thumbnail -e ${url}`)).stdout
  try {
    const reply = (await exec(`./api/yt-dlp -g --get-duration -e ${url}`))
      .stdout;
    const results: string[] = reply.toString().split("\n");
    if (results && results.length > 1) {
      const rLength = results.length - 1;
      let title: string = "";
      let video: string[] = [];
      let duration: string = "";
      if (rLength == 4) {
        //youtube
        title = results[0];
        video.push(results[1]); //video
        video.push(results[2]); //audio
        duration = fixDuration(results[3]);
      } else if (rLength == 3) {
        //twitter
        title = results[0];
        video.push(results[1]); //video
        duration = fixDuration(results[2]);
      } else if (rLength == 2) {
        //instagram
        title = results[0];
        video.push(results[1]); //video
      }   
      return {
        video: video,
        duration: duration,
        title: title.replace(/[^a-zA-Z 0-9]/g, "")
      };
    }
  } catch {}
  return null;
}
