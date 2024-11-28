import express from 'express'
import { DB } from '../database.js'

export const videoDataRouter = express.Router()

videoDataRouter.get('/', (req, res) => {
    DB.all(`SELECT * FROM Videos`, (err, row) => {
        if (err) {
            console.log(err)
        } else {
            res.json(row)
        }
    })

    // DB.all(`SELECT * FROM Transcripts`, (err, row) => {
    //     if(err) {
    //         console.log(err)
    //     } else {
    //         transcripts = row
    //     }
    // })
})

// videoDataRouter.get('/:id', async (req, res) => {
//     const id = req.params.id
    
//     try {
//         // First query for words
//         const allWords = await new Promise((resolve, reject) => {
//             DB.all(`SELECT Words.punctuated_word, Words.start_time, Words.end_time 
//                 FROM videos
//                 INNER JOIN Transcripts ON videos.id = Transcripts.video_id
//                 INNER JOIN Sentences ON Transcripts.id = Sentences.transcript_id
//                 INNER JOIN Words ON videos.id = Words.video_id
//                 WHERE videos.id = ?`, [id], (err, rows) => {
//                     if (err) reject(err);
//                     else resolve(rows);
//                 });
//         });

//         // Second query for sentences
//         const allSentences = await new Promise((resolve, reject) => {
//             DB.all(`SELECT Sentences.sentence, Sentences.end_time, Sentences.start_time
//                 FROM videos
//                 INNER JOIN Transcripts ON videos.id = Transcripts.video_id
//                 INNER JOIN Sentences ON Transcripts.id = Sentences.transcript_id
//                 INNER JOIN Words ON videos.id = Words.video_id
//                 WHERE videos.id = ?`, [id], (err, rows) => {
//                     if (err) reject(err);
//                     else resolve(rows);
//                 });
//         });

//         // Send response after both queries complete
//         res.status(200).json({ allSentences, allWords });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Database error' });
//     }
// });



videoDataRouter.get('/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        const path = await new Promise((resolve, reject) => {
            DB.get(`SELECT path FROM Videos WHERE id = $id`, {$id: id}, (err, row) => {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    resolve(row)
                }
            })
        })

        // Get words - simplified query with DISTINCT
        const allWords = await new Promise((resolve, reject) => {
            DB.all(`
                SELECT DISTINCT 
                    Words.punctuated_word, 
                    Words.start_time, 
                    Words.end_time 
                FROM Words
                WHERE Words.video_id = ?
                ORDER BY Words.start_time
            `, [id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Get sentences - simplified query with DISTINCT
        const allSentences = await new Promise((resolve, reject) => {
            DB.all(`
                SELECT DISTINCT 
                    Sentences.sentence, 
                    Sentences.end_time, 
                    Sentences.start_time
                FROM Sentences
                INNER JOIN Transcripts ON Transcripts.id = Sentences.transcript_id
                WHERE Transcripts.video_id = ?
                ORDER BY Sentences.start_time
            `, [id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.status(200).json({ allSentences, allWords, path });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

