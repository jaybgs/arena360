
import express from 'express';
import { createCircleGatewayServer, manifestResponse } from '@nibgate/sdk/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

const nibgate = createCircleGatewayServer({
    origin: process.env.NIBGATE_SITE_ORIGIN || 'http://localhost:5000',
    secret: process.env.NIBGATE_SECRET || 'dev_secret',
    network: process.env.NIBGATE_PAYMENT_NETWORK || 'eip155:5042002'
});

app.use(express.static(__dirname));
app.use(express.json());

// Initialize Database
async function initDB() {
    if (!pool) return;
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS articles (
                id VARCHAR(255) PRIMARY KEY,
                title TEXT,
                description TEXT,
                type VARCHAR(50),
                price VARCHAR(50),
                currency VARCHAR(10),
                recipient VARCHAR(255),
                path TEXT,
                tags JSONB,
                access_humans VARCHAR(50),
                access_agents VARCHAR(50),
                unlock_mode VARCHAR(50)
            );
        `);
        const res = await pool.query('SELECT COUNT(*) FROM articles');
        if (parseInt(res.rows[0].count) === 0) {
            console.log('Seeding database from nibgate.json...');
            const raw = fs.readFileSync(path.join(__dirname, 'nibgate.json'), 'utf8');
            const data = JSON.parse(raw);
            for (const r of data.content) {
                await pool.query(`
                    INSERT INTO articles (id, title, description, type, price, currency, recipient, path, tags, access_humans, access_agents, unlock_mode)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                `, [r.id, r.title, r.description, r.type, r.price, r.currency, r.recipient, r.path, JSON.stringify(r.tags), r.access.humans, r.access.agents, r.unlock.mode]);
            }
        }
    } catch (err) {
        console.error('DB Init Error:', err);
    }
}
initDB();

// Discovery manifest
app.get('/nibgate.json', async (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const actualOrigin = `${protocol}://${host}`;
    
    let content = [];
    if (pool) {
        const query = 'SELECT * FROM articles';
        const dbRes = await pool.query(query);
        content = dbRes.rows.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
            type: r.type,
            price: r.price,
            currency: r.currency,
            recipient: r.recipient,
            path: r.path,
            url: `${actualOrigin}${r.path}`,
            tags: r.tags,
            access: { humans: r.access_humans, agents: r.access_agents },
            unlock: { mode: r.unlock_mode }
        }));
    } else {
        const raw = fs.readFileSync(path.join(__dirname, 'nibgate.json'), 'utf8');
        const data = JSON.parse(raw);
        content = data.content;
        content.forEach(r => { r.url = `${actualOrigin}${r.path}`; });
    }
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.json({ origin: actualOrigin, content });
});

// API for access
app.get('/api/nibgate/access', async (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).send('Missing id');
    
    let resource;
    if (pool) {
        const dbRes = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
        if (dbRes.rows.length > 0) {
            const r = dbRes.rows[0];
            resource = { price: r.price, access: { humans: r.access_humans } };
        }
    } else {
        const raw = fs.readFileSync(path.join(__dirname, 'nibgate.json'), 'utf8');
        resource = JSON.parse(raw).content.find(r => String(r.id) === String(id));
    }
    
    if (!resource) return res.status(404).send('Not found');

    if (resource.access && resource.access.humans === 'paid') {
        return res.status(402).json({ 
            error: 'Payment Required', 
            code: 'payment_required',
            price: resource.price || '0.00'
        });
    }
    
    res.json({ success: true, message: 'Access granted' });
});

// Admin API to toggle gating
app.post('/api/admin/update-gate', async (req, res) => {
    const { id, access, price, password } = req.body;
    if (password !== 'admin123') return res.status(403).send('Forbidden');
    
    if (pool) {
        let updateQuery = 'UPDATE articles SET access_humans = $1, access_agents = $1';
        let params = [access, id];
        if (price !== undefined && price !== null) {
            updateQuery += ', price = $3';
            params.push(String(price));
        }
        updateQuery += ' WHERE id = $2';
        await pool.query(updateQuery, params);
        return res.json({ success: true });
    } else {
        const filePath = path.join(__dirname, 'nibgate.json');
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        const resource = data.content.find(r => String(r.id) === String(id));
        if (resource) {
            resource.access = resource.access || {};
            resource.access.humans = access;
            resource.access.agents = access;
            if (price !== undefined && price !== null) {
                resource.price = String(price);
            }
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            return res.json({ success: true });
        }
    }
    res.status(404).send('Not found');
});

// Admin Route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Article Route (backwards compatibility)
app.get('/article', (req, res) => {
    res.sendFile(path.join(__dirname, 'article.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
