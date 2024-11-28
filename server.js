//dependancies go below
import express from 'express';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { loginRouter } from './routes/login.js'
import { signupRouter } from './routes/signup.js';
import { createSentencesTable, createTranscriptsTable, createVideoTable, DB, initDatabase, initializeTables } from './database.js';
import { ffmpegRouter } from './routes/ffmpeg.js';
import { videoDataRouter } from './routes/videodata.js';


//initializations go below
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const server = express();


//Middlewares
server.use(express.static(path.join(__dirname, 'public')))
server.use(express.static(path.join(__dirname, 'private')))
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use((req, res, next) => {
    res.header('Cross-Origin-Embedder-Policy', 'require-corp');
    res.header('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});

server.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

server.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'home.html'))
})

server.get('/watch/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'private', 'watch.html'))
})

//Routes
server.use('/login', loginRouter)
server.use('/signup', signupRouter)
server.use('/convert', ffmpegRouter)
server.use('/videoData', videoDataRouter) //route for getting all video data & creating menu items
// server.use('/watch/:id', watch)

//Listener port
server.listen(8000, async () => {
    try {
        await initializeTables(DB)
        console.log('Server and database started successfully')
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1); 
    }
})