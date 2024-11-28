import dotenv from 'dotenv';
import { createClient } from '@deepgram/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const transcribeFile = async (outputPath) => {
    const deepgram = createClient(process.env.Deepgram_API)

    return new Promise(async (resolve, reject) => {
        try {
            const mp3 = await fs.readFile(outputPath);
            const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
                mp3,
                {
                    model: "nova-2",
                    smart_format: true,
                    mimetype: 'audio/mp3',
                    diarize: true,
                }
            )
            
            if(error) {
                console.log('Deepgram error: ' + error)
                reject(error)
            } 
            resolve(result)
        } catch (error) {
            console.error('Error at 33:', err);
            throw err;
        }
    })
}

