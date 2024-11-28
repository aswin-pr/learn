import express from 'express'
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import { DB } from '../database.js'

export const signupRouter = express.Router();
const __dirname = dirname(fileURLToPath(import.meta.url))
const saltRounds = 10;


//Hashing operation
async function hashPasswords(email, password) {
    return new Promise(function(resolve, reject) {
        try {
            bcrypt.genSalt(saltRounds, (err, salt) => {
                    if (err) {
                        reject(err)
                    } else {
                        bcrypt.hash(password, salt, async (err, hash) => {
                            if (err) {
                                reject(err)
                            } else {
                                try {
                                    await insertDataIntoDB(email, hash) //Data inserted into DB Users
                                    console.log('password hasing & insertion successful')
                                    resolve(hash)
                                } catch (error) {
                                    reject(error)
                                }
                            }
                        })
                    }
                }
            )
        } catch (error) {
            console.error(error)
            reject(error)
        }
    })
}


function insertDataIntoDB(email, hash) {
    return new Promise((resolve, reject) => {
        DB.run(`INSERT INTO Users (email, hash) VALUES 
            ($email, $hash)`, {
            $email: email,
            $hash: hash
        }, function(err) {
            if (err) {
                console.error('ERROR AT: ' + err)
                reject(err)
            } else {
                console.log(`New user created at ${this.lastID}`)
                resolve()
            }
        })
    })
}


//Middleware func
signupRouter.use('/', (req, res, next) => {
    const { email } = req.body;
    const emailRegex = /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
    
    if (email.match(emailRegex)) {
        console.log('Email validation successful')
        next()
    } else {
        console.log('Validation Failed: Invalid Email')
        res.status(400).json({error: 'Invalid Email'})
    }
})


//Router
signupRouter.post('/', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const result = await hashPasswords(email, password)
        res.status(201).json({ 
            message: 'User created successfully' 
        });
    } catch (error) {
        console.error('Signup error:', error);
        const SQLITE_CONSTRAINT_ERROR = 19

        if (error.errno == SQLITE_CONSTRAINT_ERROR) {
            return res.status(409).json({error: 'Email already exists.'})
        }

        return res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
})



