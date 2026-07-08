import fs from 'fs';
let content = fs.readFileSync('./data/articles.js', 'utf8');
const broken = [
    "https://images.unsplash.com/photo-1518605368461-1e12d53725f1?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1600250395378-96f7c468700a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1536557688219-c603b7b414c1?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1431324155629-1a6d0a11f4d5?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1486286701208-1d58e833802e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550091910-394bfdf8e6bd?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1574629810360-7efbb1925536?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1615690325497-6a1be60fba44?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1554068865-24cecd4e34d8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1532981559404-0371cc033068?auto=format&fit=crop&q=80&w=800"
];
broken.forEach((url, i) => {
    content = content.replace(url, `https://picsum.photos/seed/sport${i}/800/500`);
});
fs.writeFileSync('./data/articles.js', content, 'utf8');
console.log("Images fixed.");
