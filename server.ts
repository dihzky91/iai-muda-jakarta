import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import { db, schema } from './src/db/index';
import { eq } from 'drizzle-orm';

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept image files only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!') as any, false);
    }
    cb(null, true);
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve uploads directory statically BEFORE Vite middleware
  app.use('/uploads', express.static(uploadDir));

  // File Upload API endpoint
  app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'File upload failed' });
    }
  });

  // Get list of uploaded images
  app.get('/api/uploads', (req, res) => {
    try {
      const files = fs.readdirSync(uploadDir);
      const fileList = files.map(file => ({
        name: file,
        url: `/uploads/${file}`,
        time: fs.statSync(path.join(uploadDir, file)).mtime.getTime()
      })).sort((a, b) => b.time - a.time);
      
      res.json({ success: true, files: fileList });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to list uploads' });
    }
  });

  // ========== DATABASE API ENDPOINTS ==========

  // Events API
  app.get('/api/events', async (req, res) => {
    try {
      const events = await db.select().from(schema.events).orderBy(schema.events.date);
      res.json({ success: true, data: events });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch events' });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await db.select().from(schema.events).where(eq(schema.events.id, parseInt(req.params.id))).limit(1);
      if (!event.length) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      res.json({ success: true, data: event[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch event' });
    }
  });

  // Generations API
  app.get('/api/generations', async (req, res) => {
    try {
      const generations = await db.select().from(schema.generations).orderBy(schema.generations.id);
      res.json({ success: true, data: generations });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch generations' });
    }
  });

  app.get('/api/generations/:id', async (req, res) => {
    try {
      const generation = await db.select().from(schema.generations).where(eq(schema.generations.id, parseInt(req.params.id))).limit(1);
      if (!generation.length) {
        return res.status(404).json({ success: false, message: 'Generation not found' });
      }
      res.json({ success: true, data: generation[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch generation' });
    }
  });

  // Members API
  app.get('/api/members', async (req, res) => {
    try {
      const generationId = req.query.generationId ? parseInt(req.query.generationId as string) : undefined;
      let query = db.select().from(schema.members);
      
      if (generationId) {
        query = query.where(eq(schema.members.generationId, generationId)) as any;
      }
      
      const members = await query.orderBy(schema.members.id);
      res.json({ success: true, data: members });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch members' });
    }
  });

  app.get('/api/members/:id', async (req, res) => {
    try {
      const member = await db.select().from(schema.members).where(eq(schema.members.id, parseInt(req.params.id))).limit(1);
      if (!member.length) {
        return res.status(404).json({ success: false, message: 'Member not found' });
      }
      res.json({ success: true, data: member[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch member' });
    }
  });

  // Positions API
  app.get('/api/positions', async (req, res) => {
    try {
      const positions = await db.select().from(schema.positions).orderBy(schema.positions.sortOrder);
      res.json({ success: true, data: positions });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch positions' });
    }
  });

  // ========== CRUD ENDPOINTS FOR ADMIN ==========

  // Create Event
  app.post('/api/events', async (req, res) => {
    try {
      const { title, description, date, time, location, imageUrl, registrationUrl, status, generationId } = req.body;
      
      if (!title || !description || !date) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const result = await db.insert(schema.events).values({
        title,
        description,
        date,
        time: time || null,
        location: location || null,
        imageUrl: imageUrl || null,
        registrationUrl: registrationUrl || null,
        status: status || 'upcoming',
        generationId: generationId || null,
      });

      res.json({ success: true, message: 'Event created successfully', id: (result as any).insertId });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create event' });
    }
  });

  // Update Event
  app.put('/api/events/:id', async (req, res) => {
    try {
      const { title, description, date, time, location, imageUrl, registrationUrl, status, generationId } = req.body;
      const eventId = parseInt(req.params.id);

      await db.update(schema.events).set({
        title: title || undefined,
        description: description || undefined,
        date: date || undefined,
        time: time || undefined,
        location: location || undefined,
        imageUrl: imageUrl || undefined,
        registrationUrl: registrationUrl || undefined,
        status: status || undefined,
        generationId: generationId || undefined,
      }).where(eq(schema.events.id, eventId));

      res.json({ success: true, message: 'Event updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update event' });
    }
  });

  // Delete Event
  app.delete('/api/events/:id', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      await db.delete(schema.events).where(eq(schema.events.id, eventId));
      
      res.json({ success: true, message: 'Event deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to delete event' });
    }
  });

  // Create Member
  app.post('/api/members', async (req, res) => {
    try {
      const { generationId, positionId, name, division, email, imageUrl, linkedinUrl, bio, isActive } = req.body;
      
      if (!generationId || !name) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const result = await db.insert(schema.members).values({
        generationId,
        positionId: positionId || null,
        name,
        division: division || null,
        email: email || null,
        imageUrl: imageUrl || null,
        linkedinUrl: linkedinUrl || null,
        bio: bio || null,
        isActive: isActive !== false,
      });

      res.json({ success: true, message: 'Member created successfully', id: (result as any).insertId });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create member' });
    }
  });

  // Update Member
  app.put('/api/members/:id', async (req, res) => {
    try {
      const { generationId, positionId, name, division, email, imageUrl, linkedinUrl, bio, isActive } = req.body;
      const memberId = parseInt(req.params.id);

      await db.update(schema.members).set({
        generationId: generationId || undefined,
        positionId: positionId || undefined,
        name: name || undefined,
        division: division || undefined,
        email: email || undefined,
        imageUrl: imageUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        bio: bio || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      }).where(eq(schema.members.id, memberId));

      res.json({ success: true, message: 'Member updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update member' });
    }
  });

  // Delete Member
  app.delete('/api/members/:id', async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      
      await db.delete(schema.members).where(eq(schema.members.id, memberId));
      
      res.json({ success: true, message: 'Member deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to delete member' });
    }
  });

  // Create Generation
  app.post('/api/generations', async (req, res) => {
    try {
      const { slug, name, years, isActive, description } = req.body;
      
      if (!slug || !name || !years) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const result = await db.insert(schema.generations).values({
        slug,
        name,
        years,
        isActive: isActive || false,
        description: description || null,
      });

      res.json({ success: true, message: 'Generation created successfully', id: (result as any).insertId });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create generation' });
    }
  });

  // Update Generation
  app.put('/api/generations/:id', async (req, res) => {
    try {
      const { name, years, isActive, description } = req.body;
      const genId = parseInt(req.params.id);

      // If activating this generation, deactivate all others first
      if (isActive === true) {
        await db.update(schema.generations).set({ isActive: false });
      }

      await db.update(schema.generations).set({
        name: name || undefined,
        years: years || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        description: description || undefined,
      }).where(eq(schema.generations.id, genId));

      res.json({ success: true, message: 'Generation updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update generation' });
    }
  });

  // Delete Generation
  app.delete('/api/generations/:id', async (req, res) => {
    try {
      const genId = parseInt(req.params.id);
      
      await db.delete(schema.generations).where(eq(schema.generations.id, genId));
      
      res.json({ success: true, message: 'Generation deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to delete generation' });
    }
  });

  // Create Position
  app.post('/api/positions', async (req, res) => {
    try {
      const { name, category, sortOrder } = req.body;
      
      if (!name || !category) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const result = await db.insert(schema.positions).values({
        name,
        category,
        sortOrder: sortOrder || 0,
      });

      res.json({ success: true, message: 'Position created successfully', id: (result as any).insertId });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create position' });
    }
  });

  // Update Position
  app.put('/api/positions/:id', async (req, res) => {
    try {
      const { name, category, sortOrder } = req.body;
      const posId = parseInt(req.params.id);

      await db.update(schema.positions).set({
        name: name || undefined,
        category: category || undefined,
        sortOrder: sortOrder !== undefined ? sortOrder : undefined,
      }).where(eq(schema.positions.id, posId));

      res.json({ success: true, message: 'Position updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update position' });
    }
  });

  // Delete Position
  app.delete('/api/positions/:id', async (req, res) => {
    try {
      const posId = parseInt(req.params.id);
      
      await db.delete(schema.positions).where(eq(schema.positions.id, posId));
      
      res.json({ success: true, message: 'Position deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to delete position' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
