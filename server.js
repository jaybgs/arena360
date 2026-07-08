
import express from 'express';
import { createCircleGatewayServer, manifestResponse } from '@nibgate/sdk/server';
import fs from 'fs';
import path from 'path';

// Fix __dirname in ES module
import { fileURLToPath } from 'url';
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

// Discovery manifest
app.get('/nibgate.json', (req, res) => {
    const raw = fs.readFileSync(path.join(__dirname, 'nibgate.json'), 'utf8');
    const data = JSON.parse(raw);
    res.json(data);
});

// API for access
app.get('/api/nibgate/access', (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).send('Missing id');
    
    // Load resource metadata
    const raw = fs.readFileSync(path.join(__dirname, 'nibgate.json'), 'utf8');
    const resources = JSON.parse(raw).resources;
    const resource = resources.find(r => String(r.id) === String(id));
    
    if (!resource) return res.status(404).send('Not found');

    // Access check logic per SDK
    // If the resource is marked as 'paid', we mock a 402 Payment Required for demonstration.
    if (resource.access && resource.access.humans === 'paid') {
        return res.status(402).json({ error: 'Payment Required', code: 'payment_required' });
    }
    
    // Otherwise it's free
    res.json({ success: true, message: 'Access granted' });
});

// Admin API to toggle gating
app.post('/api/admin/update-gate', (req, res) => {
    const { id, access, password } = req.body;
    if (password !== 'admin123') return res.status(403).send('Forbidden');
    
    const filePath = path.join(__dirname, 'nibgate.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    
    const resource = data.resources.find(r => String(r.id) === String(id));
    if (resource) {
        resource.access = resource.access || {};
        resource.access.humans = access;
        resource.access.agents = access;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return res.json({ success: true });
    }
    res.status(404).send('Not found');
});

// Admin Route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
