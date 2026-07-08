import fs from 'fs';
import articles from './data/articles.js';

const expandedArticles = articles.map(article => {
    // Clean up any existing tags to avoid nesting issues if run multiple times
    let cleanContent = article.content.replace(/<[^>]*>?/gm, '').replace('...', '');
    
    const p1 = `<p>${cleanContent}</p>`;
    const p2 = `<p>As the narrative unfolds, fans and analysts alike are paying close attention to the tactical shifts and pivotal moments that define this era of ${article.category}. The dedication shown by the athletes is nothing short of extraordinary, pushing the boundaries of human performance and strategic ingenuity. Every single match and event serves as a testament to the rigorous training and mental fortitude required at the elite level.</p>`;
    const p3 = `<p>Looking ahead, the implications of these developments will undoubtedly shape the future of the sport. Whether it's a veteran securing their legacy or a rising star making a breakthrough, the ensuing weeks will be crucial. The drama of elite competition is what keeps the world captivated. We will continue to monitor the situation closely, bringing you the latest updates, exclusive interviews, and in-depth analysis right here on Arena360.</p>`;
    
    article.content = p1 + p2 + p3;
    return article;
});

const fileOutput = `const articles = ${JSON.stringify(expandedArticles, null, 4)};\n\nexport default articles;`;
fs.writeFileSync('./data/articles.js', fileOutput, 'utf8');
console.log("Articles content expanded successfully.");
