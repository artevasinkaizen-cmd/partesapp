
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db', 'data.json');

// Email Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Helper to read DB
const readDB = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            // Init DB if not exists
            const initDB = {
                users: [{
                    id: 'admin-1',
                    email: 'admin@admin.com',
                    password: 'admin',
                    role: 'admin',
                    user_metadata: { name: 'Super Admin' },
                    created_at: new Date().toISOString()
                }],
                partes: [],
                actuaciones: [],
                clients: []
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(initDB, null, 2));
            return initDB;
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading DB:", err);
        return { users: [], partes: [], actuaciones: [], clients: [] };
    }
};

// Helper to write DB
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing DB:", err);
        return false;
    }
};

// --- AUTH MOCK ENDPOINTS ---

app.post('/auth/send-code', async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code temporarily? Ideally yes, but for this simplified local version
    // we will return the "hash" or just trust the client to verify against what IT sends? 
    // NO, that's insecure even for local.
    // We should ideally store the code in a temp map or the DB.
    // Let's store in DB under a 'verifications' collection or similar, avoiding in-memory only.

    // For simplicity given the scope: access the code in the 'verify' step if we had one.
    // But the current frontend logic generates the code client side and mocks sending.
    // We need to change that: Backend generates code, sends email, stores code (or returns it encoded/hashed).

    // Let's store Pending Verification in DB
    const db = readDB();
    if (!db.verifications) db.verifications = [];

    // Remove old for this email
    db.verifications = db.verifications.filter(v => v.email !== email);
    db.verifications.push({ email, code, expires: Date.now() + 15 * 60 * 1000 }); // 15 min
    writeDB(db);

    try {
        const info = await transporter.sendMail({
            from: '"Partes App" <' + process.env.SMTP_USER + '>',
            to: email,
            subject: "Código de Verificación - Partes App",
            text: `Tu código de verificación es: ${code}`,
            html: `<b>Tu código de verificación es: ${code}</b>`,
        });
        console.log("Message sent: %s", info.messageId);
        res.json({ success: true, message: 'Code sent' });
    } catch (error) {
        console.error("Error sending email:", error);
        // Fallback for development if no SMTP config
        if (!process.env.SMTP_USER) {
            console.log(`[DEV MODE] Verification Code for ${email}: ${code}`);
            return res.json({ success: true, message: 'Code sent (Dev Mode - Check Console)', devCode: code });
        }
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.post('/auth/verify-code', (req, res) => {
    const { email, code } = req.body;
    const db = readDB();

    const record = (db.verifications || []).find(v => v.email === email && v.code === code);

    if (!record) return res.status(400).json({ error: 'Invalid Code' });
    if (record.expires < Date.now()) return res.status(400).json({ error: 'Code expired' });

    // Cleanup
    db.verifications = db.verifications.filter(v => v.email !== email);
    writeDB(db);

    res.json({ success: true });
});

app.post('/auth/register', (req, res) => {
    const { email, password, options } = req.body;
    const db = readDB();

    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = {
        id: 'user-' + Date.now(),
        email,
        password, // In real world, hash this!
        role: options?.data?.role || 'user', // Default to 'user', allow admin override if passed
        user_metadata: options?.data || {},
        created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    res.json({ user: newUser, session: { access_token: 'mock-token', user: newUser } });
});

app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDB();

    const user = db.users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ user, session: { access_token: 'mock-token', user } });
});

app.post('/auth/update', (req, res) => {
    const { email, data } = req.body; // In real local adapter we might pass email or token
    const db = readDB();

    const index = db.users.findIndex(u => u.email === email);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    db.users[index].user_metadata = { ...db.users[index].user_metadata, ...data };
    writeDB(db);

    res.json({ user: db.users[index] });
});

// --- GENERIC CRUD ENDPOINTS (Simulating Supabase) ---

// GET /:table
app.get('/:table', (req, res) => {
    const { table } = req.params;
    const db = readDB();

    if (!db[table]) return res.json([]);

    let query = db[table];

    // Simple filtering support (eq)
    // Query params like ?column=value
    Object.keys(req.query).forEach(key => {
        if (key !== 'order' && key !== 'select') {
            query = query.filter(item => String(item[key]) === String(req.query[key]));
        }
    });

    // Simple ordering (only one field supported for mock)
    // ?order=field.asc or ?order=field.desc
    /* 
       Note: Supabase client sends order differently, usually not via simple query params in REST exactly like this, 
       but our localClient adapter will call this URL structure.
    */

    res.json(query);
});

// Helper to save base64 to file
const saveBase64File = (base64Str, prefix) => {
    if (!base64Str || !base64Str.startsWith('data:')) return base64Str; // Return as is if url or empty

    try {
        const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) return base64Str;

        const extension = matches[1] === 'application/pdf' ? 'pdf' : 'bin';
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `${prefix}_${Date.now()}.${extension}`;
        const filePath = path.join(__dirname, 'uploads', fileName);

        // Ensure uploads dir exists (redundant if mkdir run, but safe)
        if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
            fs.mkdirSync(path.join(__dirname, 'uploads'));
        }

        fs.writeFileSync(filePath, buffer);
        return `/uploads/${fileName}`; // Return relative URL
    } catch (e) {
        console.error('Error saving file:', e);
        return null; // or throw?
    }
};

// POST /upload/avatar - Handle avatar uploads
app.post('/upload/avatar', (req, res) => {
    const { image, userId } = req.body;
    if (!image || !userId) return res.status(400).json({ error: 'Missing image or userId' });

    const savedPath = saveBase64File(image, `avatar_${userId}`);
    if (!savedPath) return res.status(500).json({ error: 'Failed to save image' });

    // Update user record with new avatar URL
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        db.users[userIndex].avatar_url = savedPath;
        // Also update metadata if needed, but top level field is fine for our mock app
        if (!db.users[userIndex].user_metadata) db.users[userIndex].user_metadata = {};
        db.users[userIndex].user_metadata.avatar_url = savedPath;

        writeDB(db);
        res.json({ success: true, avatarUrl: savedPath });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// POST /partes - Specific endpoint for debugging
app.post('/partes', (req, res) => {
    console.log('Server received POST /partes request', req.body.title); // Don't log full body if huge
    const newParte = req.body;
    const db = readDB();

    if (!db.partes) db.partes = [];

    const newItem = {
        ...newParte,
        id: newParte.id || Date.now(),
    };

    // Postgres usually adds created_at
    if (!newItem.created_at) newItem.created_at = new Date().toISOString();

    // Handle File Uploads (Convert Base64 to File System)
    if (newItem.pdf_file) {
        newItem.pdf_file = saveBase64File(newItem.pdf_file, `parte_${newItem.id}`);
    }
    if (newItem.pdf_file_signed) {
        newItem.pdf_file_signed = saveBase64File(newItem.pdf_file_signed, `parte_signed_${newItem.id}`);
    }

    db.partes.push(newItem);
    writeDB(db);
    console.log('New parte added:', newItem.id);

    res.status(201).json([newItem]); // Supabase returns array
});

// POST /:table
app.post('/:table', (req, res) => {
    const { table } = req.params;
    const db = readDB();

    if (!db[table]) db[table] = [];

    const newItem = {
        ...req.body,
        id: req.body.id || (table === 'partes' || table === 'actuaciones' ? Date.now() : Date.now().toString()) // Simple ID generation
    };

    // Postgres usually adds created_at
    if (!newItem.created_at) newItem.created_at = new Date().toISOString();

    db[table].push(newItem);
    writeDB(db);

    res.status(201).json([newItem]); // Supabase returns array
});

// PATCH /:table?id=eq.123 (Structure from our adapter will be simpler: PATCH /:table/:id)
app.patch('/:table/:id', (req, res) => {
    const { table, id } = req.params;
    const db = readDB();

    if (!db[table]) return res.status(404).json({ error: 'Table not found' });

    const index = db[table].findIndex(item => String(item.id) === String(id));
    if (index === -1) return res.status(404).json({ error: 'Item not found' });

    db[table][index] = { ...db[table][index], ...req.body };
    writeDB(db);

    res.json([db[table][index]]);
});

// DELETE /:table/:id
app.delete('/:table/:id', (req, res) => {
    const { table, id } = req.params;
    const db = readDB();

    if (!db[table]) return res.status(404).json({ error: 'Table not found' });

    const initialLength = db[table].length;
    db[table] = db[table].filter(item => String(item.id) !== String(id));

    if (db[table].length === initialLength) return res.status(404).json({ error: 'Item not found' });

    writeDB(db);
    res.status(204).send();
});


app.listen(PORT, () => {
    console.log(`Local Data Server running on http://localhost:${PORT}`);
    console.log(`Database file: ${DB_FILE}`);
});
