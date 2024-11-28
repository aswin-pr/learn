import sqlite3 from 'sqlite3';

//Creating database
function createSQliteDatabase() {
    const database = new sqlite3.Database('./userdatabase.sqlite', (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log('database created')
        }
    })

    return database;
}

//Creating
function initDatabase(DB) {
    return new Promise((resolve, reject) => {
        DB.run(`CREATE TABLE IF NOT EXISTS Users 
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                email TEXT NOT NULL UNIQUE, 
                hash TEXT NOT NULL)
            `, (err) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    console.log('Database init successful')
                    resolve();
                }
            })
    })
}

//Table for video data
function createVideoTable(DB) {
    return new Promise((resolve, reject) => {
        DB.run(`CREATE TABLE IF NOT EXISTS videos 
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                path TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.log(err + ' line 40')
                    reject(err);
                } else {
                    console.log('Video table init successful')
                    resolve();
                }
            }
        ) 
    })
}

//Table for Transcripts
function createTranscriptsTable(DB) {
    return new Promise((resolve, reject) => {
        DB.run(`CREATE TABLE IF NOT EXISTS Transcripts 
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id INTEGER NOT NULL,
                end_time INTEGER NOT NULL, 
                num_words INTEGER NOT NULL, 
                speaker INTEGER NOT NULL, 
                start_time INTEGER NOT NULL,
                FOREIGN KEY (video_id) REFERENCES videos(id)
            )`, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Transcripts table init successful');
                    resolve();
                }
            });
    });
}


//Table for sentences
function createSentencesTable(DB) {
    return new Promise((resolve, reject) => {
        DB.run(`CREATE TABLE IF NOT EXISTS Sentences 
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                transcript_id INTEGER NOT NULL,
                sentence TEXT NOT NULL, 
                start_time INTEGER NOT NULL, 
                end_time INTEGER NOT NULL, 
                sentence_index INTEGER NOT NULL,
                FOREIGN KEY (transcript_id) REFERENCES Transcripts(id)
            )`, (err) => {
                if(err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
    })
}

//Table for storing single word
function createWordTable(DB) {
    return new Promise((resolve, reject) => {
        DB.run(`CREATE TABLE IF NOT EXISTS Words 
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                video_id INTEGER NOT NULL,
                word TEXT NOT NULL, 
                start_time INTEGER NOT NULL, 
                end_time INTEGER NOT NULL, 
                confidence REAL NOT NULL,
                speaker INTEGER NOT NULL,
                speaker_confidence REAL NOT NULL,
                punctuated_word TEXT NOT NULL,
                FOREIGN KEY (video_id) REFERENCES videos(id)
            )`, (err) => {
                if(err) {
                    reject(err)
                } else {
                    console.log('Words table init successful');
                    resolve()
                }
            })
    })
}






export const DB = createSQliteDatabase();

async function initializeTables() {
    try {
        await new Promise((resolve, reject) => {
            DB.run('PRAGMA foreign_keys = ON', (err) => {
                if (err) reject(err);
                else resolve();
            })
        })

        await initDatabase(DB);
        await createVideoTable(DB);
        await createTranscriptsTable(DB);
        await createSentencesTable(DB);
        await createWordTable(DB)
        console.log('All tables initialized successfully');
    } catch (error) {
        console.error('Error initializing tables:', error);
        throw error;
    }
}

initializeTables(DB).catch(console.error)

export { initializeTables, initDatabase, createVideoTable, createTranscriptsTable, createSentencesTable, createWordTable } 