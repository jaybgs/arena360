import fs from 'fs';
import path from 'path';
import https from 'https';

const categories = {
    'Football': 'football match',
    'Basketball': 'basketball match',
    'Tennis': 'tennis match',
    'Formula 1': 'formula 1 race car',
    'Cricket': 'cricket match'
};

const userAgent = 'SportsBlogAgent/1.0 (https://github.com/jaybgs/arena360; bot@example.com)';

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': userAgent } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return fetchJson(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Status ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

import { execSync } from 'child_process';

async function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        try {
            // Use native curl.exe with Chrome User-Agent to bypass 403 blocks
            const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
            execSync(`curl.exe -s -A "${ua}" -L "${url}" -o "${dest}"`);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
    let articlesContent = fs.readFileSync('./data/articles.js', 'utf8');
    const match = articlesContent.match(/const\s+articles\s*=\s*(\[\s*\{[\s\S]*\}\s*\])\s*;/);
    if (!match) throw new Error("Could not parse articles.js");
    let articles = JSON.parse(match[1]);

    const destDir = path.join(process.cwd(), 'assets');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

    let categoryUrls = {};
    for (const [cat, query] of Object.entries(categories)) {
        console.log(`Searching Wikimedia for ${query}...`);
        const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url&format=json`;
        const result = await fetchJson(apiUrl);
        let urls = [];
        if (result && result.query && result.query.pages) {
            for (let pageId in result.query.pages) {
                const info = result.query.pages[pageId].imageinfo;
                if (info && info[0] && info[0].url && !info[0].url.endsWith('.svg') && !info[0].url.endsWith('.pdf')) {
                    urls.push(info[0].url);
                }
            }
        }
        categoryUrls[cat] = urls;
    }

    let count = {};
    for (let i = 0; i < articles.length; i++) {
        let article = articles[i];
        let cat = article.category;
        count[cat] = (count[cat] || 0) + 1;
        
        let lock = count[cat];
        let urls = categoryUrls[cat];
        
        if (!urls || urls.length === 0) {
            console.error(`No images found for category ${cat}`);
            continue;
        }

        // Pick a unique image per article in this category
        let index = (lock - 1) % urls.length; 
        let imgUrl = urls[index];
        let ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
        let filename = `wiki_${cat.toLowerCase().replace(' ', '')}_${lock}${ext}`;
        let dest = path.join(destDir, filename);

        console.log(`Downloading ${filename} from ${imgUrl}...`);
        await downloadFile(imgUrl, dest);
        await delay(1000); // 1 second delay to prevent 429
        
        article.image = `assets/${filename}`;
    }

    const newFile = `const articles = ${JSON.stringify(articles, null, 4)};\n\nexport default articles;`;
    fs.writeFileSync('./data/articles.js', newFile, 'utf8');
    console.log('Finished downloading wikimedia images and updating articles.js');
}

run().catch(console.error);
