import fs from 'fs';
import path from 'path';
import https from 'https';

const searchTerms = {
    'Football': 'football',
    'Basketball': 'basketball',
    'Tennis': 'tennis',
    'Formula 1': 'f1',
    'Cricket': 'cricket'
};

let articlesContent = fs.readFileSync('./data/articles.js', 'utf8');
const match = articlesContent.match(/const\s+articles\s*=\s*(\[\s*\{[\s\S]*\}\s*\])\s*;/);
if (!match) {
    console.error("Could not parse articles.js");
    process.exit(1);
}

let articles = JSON.parse(match[1]);

async function download(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return download(res.headers.location, dest).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
    });
}

async function run() {
    const destDir = path.join(process.cwd(), 'assets');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);
    
    let count = {};
    for (let i = 0; i < articles.length; i++) {
        let article = articles[i];
        let cat = article.category;
        count[cat] = (count[cat] || 0) + 1;
        
        let term = searchTerms[cat];
        let lock = count[cat] + 10; // offset lock for different images
        let filename = `real_${cat.toLowerCase().replace(' ', '')}_${lock}.jpg`;
        let dest = path.join(destDir, filename);
        
        console.log(`Downloading ${filename}...`);
        let url = `https://picsum.photos/seed/${term}${lock}/800/600`;
        await download(url, dest);
        
        article.image = `assets/${filename}`;
    }
    
    const newFile = `const articles = ${JSON.stringify(articles, null, 4)};\n\nexport default articles;`;
    fs.writeFileSync('./data/articles.js', newFile, 'utf8');
    console.log('All images downloaded and articles updated!');
}

run().catch(console.error);
