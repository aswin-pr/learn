import express from 'express'

const watch = express.Router()


watch.get('/:id', async (req, res, next) => {
    const id = req.params.id

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
})