import fs from 'fs';
import path from 'path';

// Define the generated images
const images = {
    "Football": "football_action_1783521042320.png",
    "Basketball": "basketball_dunk_1783521056579.png",
    "Tennis": "tennis_match_1783521069437.png",
    "Formula 1": "formula1_race_1783521081477.png",
    "Cricket": "cricket_game_1783521093170.png"
};

const sourceDir = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\abf2ddd8-2470-4b14-b9b3-d7f383cbf5dc";
const destDir = path.join(process.cwd(), 'assets');

// Create assets directory
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}

// Copy images
for (const [category, filename] of Object.entries(images)) {
    const sourcePath = path.join(sourceDir, filename);
    const destPath = path.join(destDir, filename);
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${filename}`);
    } else {
        console.error(`Source not found: ${sourcePath}`);
    }
}

// Update articles.js
import articles from './data/articles.js';

const updatedArticles = articles.map(article => {
    if (images[article.category]) {
        article.image = `assets/${images[article.category]}`;
    }
    return article;
});

const fileOutput = `const articles = ${JSON.stringify(updatedArticles, null, 4)};\n\nexport default articles;`;
fs.writeFileSync('./data/articles.js', fileOutput, 'utf8');
console.log("Articles updated with new local images.");
