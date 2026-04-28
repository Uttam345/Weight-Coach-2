import fs from 'fs';
import fetch from 'node-fetch'; // We'll just use global fetch if Node 18+

async function run() {
    try {
        const res = await fetch('http://localhost:5001/api/workouts/history', {
            headers: {
                'Content-Type': 'application/json',
                // How to get token? I don't have it easily.
            }
        });
        console.log(await res.text());
    } catch(e) {
        console.error(e);
    }
}
run();
