import express from 'express';
import { DB } from '../database.js';
import bcrypt from 'bcrypt';

export const loginRouter = express.Router()

loginRouter.post('/', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const result = await loginDBFetch(email, password)
        if (result === true) {
            console.log(result)
            res.status(201).json({url: '/home'})
        }
    } catch (error) {
        console.log(error)
        if (error === 'Invalid password') {
            res.status(401).send('Unauthorized')
        }
    }
})


async function loginDBFetch(email, password) {
    return new Promise((resolve, reject) => {
        DB.get('SELECT email, hash FROM Users WHERE email = $email', {
            $email: email
        }, async (err, row) => {
            if (err) {
                console.log(err)
                reject(err)
                return;
            } 
            
            if (!row) {
                reject('User not found')
                return;
            }
            
            try {
                const { email, hash } = row;
                const match = await bcrypt.compare(password, hash)
                if(match) {
                    resolve(match)
                } else {
                    reject('Invalid password')
                }
            } catch (error) {
                reject(error)
            }
        })
    })
}