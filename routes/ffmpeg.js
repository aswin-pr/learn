import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from 'ffmpeg-static';
import express from 'express';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createFolder, cleanupFiles } from "./utils.js";
import fs from 'fs/promises';
import { transcribeFile } from "../utlility/deepgram_api.js";
import { DB } from "../database.js";

// Get absolute paths
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Define upload and converted directories
const UPLOAD_DIR = join(projectRoot, 'uploads');
const CONVERTED_DIR = join(projectRoot, 'converted');

console.log('Upload directory:', UPLOAD_DIR);
console.log('Converted directory:', CONVERTED_DIR);

// Configure ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

// Create directories
await createFolder(UPLOAD_DIR);
await createFolder(CONVERTED_DIR);

// Configure multer
const upload = multer({
    dest: UPLOAD_DIR,
    limits: {
        fileSize: 1000 * 1024 * 1024, // 100MB limit
    },
});

const extractAudio = async (inputPath, outputPath) => {
    console.log('Input path:', inputPath);
    console.log('Output path:', outputPath);
    
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('mp3')
            .outputOptions('-ab', '192k')
            .on('start', (commandLine) => {
                console.log('FFmpeg command:', commandLine);
            })
            .on('progress', (progress) => {
                console.log('Processing: ', progress);
            })
            .on('end', () => {
                console.log('Conversion completed successfully');
                resolve('Audio extraction complete');
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                reject(new Error(`Extraction error: ${err}`));
            })
            .save(outputPath);
    });
}

export const ffmpegRouter = express.Router();

ffmpegRouter.post('/', upload.single('video'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No video file uploaded');
    }

    // console.log('Uploaded file:', req.file);

    //receive file & store the file path
    const inputPath = req.file.path; 
    const fileName = req.file.originalname;
    console.log(fileName)
    const lastVideoId = await insertIntoVideoTable(fileName, inputPath) //Inseting the video path into the video table
    // console.log(lastVideoId + ' at line 76')

    const outputPath = join(CONVERTED_DIR, `${req.file.filename}.mp3`);

    try {
        await extractAudio(inputPath, outputPath);

        // Verify file exists before sending
        await fs.access(outputPath);
        // console.log('Output file exists at:', outputPath);

        //Using deepgram
        try {
            await transcribeFile(outputPath).then(async (result) => {
                const paragraphs = result.results.channels[0].alternatives[0].paragraphs.paragraphs;
                const allWords = result.results.channels[0].alternatives[0].words

                //we'll be setting up the database logic to store the above result in the backend   
                for (const items of paragraphs) {
                    const para = items.sentences;
                    const transcriptID = await insertIntoTranscriptsTable(lastVideoId, items.end, items.num_words, items.speaker, items.start)

                    para.map(async (item, index) => {
                        // console.log(item.text) //prints individual text lines that needs to be stored in the sentences table
                        await insertIntoSentencesTable(transcriptID, item.text, item.start, item.end, index)
                    })
                }

                for (const word of allWords) {
                    insertIntoWordsTable(lastVideoId, word.word, word.start, word.end, word.confidence, word.speaker, word.speaker_confidence, word.punctuated_word)
                }

                // await cleanupFiles(inputPath, outputPath);
               res.status(200).json({result, lastVideoId}) //Change made
            }).catch((err) => console.log(err + ' Line 97'))
            
        } catch (error) {
            // await cleanupFiles(inputPath, outputPath)
            console.log('Transcription failed:', error)
            res.status(400).send()
        }


        //instead of download, we need to send it to deepgram
        // res.download(outputPath, async (err) => {
        //     if (err) {
        //         console.error('Error sending file:', err);
        //     }
        //     // Cleanup files after sending
        //     await cleanupFiles(inputPath, outputPath);
        // });
    } catch (error) {
        console.error('Conversion error:', error);
        await cleanupFiles(inputPath, outputPath);
        res.status(500).send(`Conversion failed: ${error.message}`);
    }
});

function insertIntoVideoTable(name, path) {
    return new Promise((resolve, reject) => {
        DB.run(`INSERT INTO videos (name, path) VALUES ($name, $path)`, 
            {
                $path: path,
                $name: name
            }, function(err) {
                if(err) {
                    console.log(err)
                    reject(err)
                } else {
                    // console.log(`Video entry at ${this.lastID}`)
                    resolve(this.lastID)
                }
            })
    })
}

function insertIntoTranscriptsTable(id, end, num, speaker, start) {
    return new Promise((resolve, reject) => { 
        DB.run(`INSERT INTO transcripts (video_id, end_time, num_words, speaker, start_time) 
                VALUES ($video_id, $end_time, $num_words, $speaker, $start_time)`, 
            {
                $video_id: id,      
                $end_time: end,
                $num_words: num,
                $speaker: speaker,
                $start_time: start
            }, function(err) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    // console.log(`Transcript entry at ${this.lastID}`)
                    resolve(this.lastID)
                }
            })
    })
}

function insertIntoSentencesTable(transcriptID, sentence, start, end, sentenceIndex) {
    return new Promise((resolve, reject) => { 
        DB.run(`INSERT INTO sentences (transcript_id, sentence, start_time, end_time, sentence_index) 
                VALUES ($transcript_id, $sentence, $start_time, $end_time, $sentence_index)`, 
            {
                $transcript_id: transcriptID,      
                $sentence: sentence,
                $start_time: start,
                $end_time: end,
                $sentence_index: sentenceIndex
            }, function(err) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    // console.log(`Sentences entry at ${this.lastID}`)
                    resolve(this.lastID)
                }
            })
    })
}

function insertIntoWordsTable(video_id, word, start, end, confidence, speaker, speaker_confidence, punctuated_word) {
    return new Promise((resolve, reject) => { 
        DB.run(`INSERT INTO words (video_id, word, start_time, end_time, confidence, speaker, speaker_confidence, punctuated_word) 
                VALUES ($video_id, $word, $start_time, $end_time, $confidence, $speaker, $speaker_confidence, $punctuated_word)`, 
            {
                $video_id: video_id,      
                $word: word,
                $start_time: start,
                $end_time: end,
                $confidence: confidence,
                $speaker: speaker,
                $speaker_confidence: speaker_confidence,
                $punctuated_word: punctuated_word
            }, function(err) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    // console.log(`Words entry at ${this.lastID}`)
                    resolve(this.lastID)
                }
            })
    })
}