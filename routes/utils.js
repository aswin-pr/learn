// utils.js
import fs from 'fs/promises';
import { constants } from 'fs';

export async function createFolder(path) {
    try {
        await fs.access(path, constants.F_OK);
        console.log(`Directory exists: ${path}`);
    } catch {
        await fs.mkdir(path, { recursive: true });
        console.log(`Created directory: ${path}`);
    }
}

export async function cleanupFiles(...paths) {
    for (const path of paths) {
        try {
            await fs.access(path);
            await fs.unlink(path);
            console.log(`Deleted file: ${path}`);
        } catch (error) {
            console.error(`Failed to delete ${path}:`, error);
        }
    }
}