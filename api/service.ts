import * as cProcess from 'child_process'
const util = require('util');
const exec = util.promisify(cProcess.exec);
import * as ffmpeg from 'fluent-ffmpeg'
import express from 'express';
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);


export async function downloadVideo(video:string,audio:string, start:string, duration:string, title:string,res:express.Response){
    res.setHeader('Content-type', 'video/avi');
    res.setHeader('Content-Disposition', `attachment; filename=${title}-Clip:${start}:${+start+ +duration}.avi`);

    ffmpeg.default().addInput(video).addInputOption('-ss '+start).addInput(audio).addInputOption("-ss "+ start).videoCodec('copy').audioCodec('aac').addOutputOption('-t '+duration).on('end', function (err) {
        if (!err)
         console.log("Successfull");
      })
      .on('error', function(err, stdout, stderr) {
        if (err) {
            console.log(err.message);
            console.log("stdout:\n" + stdout);
            console.log("stderr:\n" + stderr);
        }
      })
      .on('progress', function(progress ) {
        console.log('Processing: ' + progress.timemark);
      }).format('avi').output(res, {end:true}).run();
}

export async function getInfo(url:string){
    //const reply = (await exec(`.\\yt-dlp.exe -g --get-duration --get-thumbnail -e ${url}`)).stdout
    const reply = (await exec(`api/yt-dlp -g --get-duration --get-thumbnail -e ${url}`)).stdout
    const results = reply.toString().split("\n")
    if(results && results.length-1 == 5)
    {   const title = results[0];
        const thumbnail = results[3]
        const timeString = results[4].split(":");
        let time = results[4];
        if(timeString.length == 1)
        {
            time = `00:00:${time}`
        }else if (timeString.length == 2){
            time = `00:${time}`
        }
        return {video: [results[1],results[2]], duration: time,title:title,thumbnail:thumbnail}
    }
    return null;
}


