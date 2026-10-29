const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. الاتصال بقاعدة بيانات SQLite (أنشئ ملف باسم database.db تلقائياً)
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// 2. إنشاء الجدول وإضافة بيانات تجريبية لو مش موجودة
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT
    )`);

    // التأكد من وجود بيانات تجريبية
    db.get("SELECT COUNT(*) AS count FROM items", (err, row) => {
        if (row && row.count === 0) {
            const stmt = db.prepare("INSERT INTO items (name, description) VALUES (?, ?)");
            stmt.run("Item 1", "This is the first sample item from database");
            stmt.run("Item 2", "This is the second sample item from database");
            stmt.run("Item 3", "This is the third sample item from database");
            stmt.finalize();
            console.log("Sample items inserted.");
        }
    });
});

// 3. مسار API لجلب قائمة العناصر (GET Request)
app.get('/api/items', (req, res) => {
    db.all("SELECT * FROM items", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// تشغيل السيرفر على البورت 5000
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});