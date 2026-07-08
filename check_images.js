import fs from 'fs';
import https from 'https';

const articlesContent = fs.readFileSync('./data/articles.js', 'utf8');

const urlRegex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+\?auto=format&fit=crop&q=80&w=800/g;
const urls = [...articlesContent.matchAll(urlRegex)].map(m => m[0]);

async function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve({ url, status: res.statusCode });
        }).on('error', (e) => {
            resolve({ url, status: 500, error: e.message });
        });
    });
}

async function main() {
    for (const url of urls) {
        const result = await checkUrl(url);
        if (result.status !== 200) {
            console.log(`BROKEN: ${url} (Status: ${result.status})`);
        }
    }
    console.log("Done checking.");
}

main();
