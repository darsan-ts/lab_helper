const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FILES_DIR = path.join(__dirname, 'files');

// Ensure 'files' directory exists
if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to sanitize filenames (prevents directory traversal attacks)
function sanitizeFilename(filename) {
    return path.basename(filename);
}

// 1. GET /api/files - List all text files in the files directory
app.get('/api/files', (req, res) => {
    fs.readdir(FILES_DIR, (err, filenames) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read files directory.' });
        }

        const fileList = filenames.map(name => {
            const ext = path.extname(name).toLowerCase();
            let language = 'plaintext';
            if (ext === '.js') language = 'javascript';
            else if (ext === '.py') language = 'python';
            else if (ext === '.css') language = 'css';
            else if (ext === '.html') language = 'html';
            else if (ext === '.json') language = 'json';

            return {
                id: name,
                name: name,
                language: language
            };
        });

        res.json(fileList);
    });
});

// 2. GET /api/files/:filename - Get file content
app.get('/api/files/:filename', (req, res) => {
    const filename = sanitizeFilename(req.params.filename);
    const filePath = path.join(FILES_DIR, filename);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'File not found.' });
            }
            return res.status(500).json({ error: 'Error reading file.' });
        }
        res.json({ name: filename, content: data });
    });
});

// 3. POST /api/files - Create a new file or write/save content
app.post('/api/files', (req, res) => {
    const { filename, content } = req.body;
    if (!filename) {
        return res.status(400).json({ error: 'Filename is required.' });
    }

    const safeName = sanitizeFilename(filename);
    const filePath = path.join(FILES_DIR, safeName);

    fs.writeFile(filePath, content || '', 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to write file.' });
        }
        res.json({ message: 'File saved successfully.', name: safeName });
    });
});

// 4. PUT /api/files/:filename - Rename a file
app.put('/api/files/:filename', (req, res) => {
    const oldName = sanitizeFilename(req.params.filename);
    const { newName } = req.body;

    if (!newName) {
        return res.status(400).json({ error: 'New filename is required.' });
    }

    const oldPath = path.join(FILES_DIR, oldName);
    const safeNewName = sanitizeFilename(newName);
    const newPath = path.join(FILES_DIR, safeNewName);

    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to rename file.' });
        }
        res.json({ message: 'File renamed successfully.', name: safeNewName });
    });
});

// 5. DELETE /api/files/:filename - Delete a file
app.delete('/api/files/:filename', (req, res) => {
    const filename = sanitizeFilename(req.params.filename);
    const filePath = path.join(FILES_DIR, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'File not found.' });
            }
            return res.status(500).json({ error: 'Failed to delete file.' });
        }
        res.json({ message: 'File deleted successfully.' });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`  VS Code Server running on http://localhost:${PORT}`);
    console.log(`  Files directory: ${FILES_DIR}`);
    console.log(`================================================`);
});