import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db, schema } from './src/db/index';
import { eq } from 'drizzle-orm';
import { signToken, authenticate, requireRole } from './src/server/auth';

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
  app.use(cookieParser());

  // Serve uploads directory statically BEFORE Vite middleware
  app.use('/uploads', express.static(uploadDir));

  // File Upload API endpoint
  app.post('/api/upload', authenticate, requireRole('superadmin', 'admin', 'editor'), upload.single('image'), (req, res) => {
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

  // ========== AUTH ENDPOINTS ==========

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
      }

      const rows = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
      const user = rows[0];

      if (!user) {
        return res.status(401).json({ success: false, message: 'Username atau password salah' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Username atau password salah' });
      }

      const token = signToken({ userId: user.id, username: user.username, role: user.role });

      // Set httpOnly cookie for session persistence
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });

      res.json({
        success: true,
        user: { id: user.id, username: user.username, role: user.role },
        token,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Login failed' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true, message: 'Logged out' });
  });

  // Get current authenticated user
  app.get('/api/auth/me', authenticate, (req, res) => {
    res.json({ success: true, user: req.user });
  });

  // ========== USER MANAGEMENT (superadmin only) ==========

  // List all users
  app.get('/api/users', authenticate, requireRole('superadmin'), async (req, res) => {
    try {
      const users = await db
        .select({ id: schema.users.id, username: schema.users.username, role: schema.users.role, createdAt: schema.users.createdAt })
        .from(schema.users)
        .orderBy(schema.users.createdAt);
      res.json({ success: true, data: users });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch users' });
    }
  });

  // Create user
  app.post('/api/users', authenticate, requireRole('superadmin'), async (req, res) => {
    try {
      const { username, password, role } = req.body;
      if (!username || !password || !role) {
        return res.status(400).json({ success: false, message: 'username, password, and role are required' });
      }
      if (!['superadmin', 'admin', 'editor'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      // Check duplicate
      const existing = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Username sudah digunakan' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const result = await db.insert(schema.users).values({ username, passwordHash, role });
      res.json({ success: true, message: 'User created', id: (result as any).insertId });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create user' });
    }
  });

  // Update user (role or password)
  app.put('/api/users/:id', authenticate, requireRole('superadmin'), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role, password } = req.body;

      const updates: Record<string, any> = {};
      if (role) {
        if (!['superadmin', 'admin', 'editor'].includes(role)) {
          return res.status(400).json({ success: false, message: 'Invalid role' });
        }
        updates.role = role;
      }
      if (password) {
        updates.passwordHash = await bcrypt.hash(password, 12);
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'Nothing to update' });
      }

      await db.update(schema.users).set(updates).where(eq(schema.users.id, userId));
      res.json({ success: true, message: 'User updated' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update user' });
    }
  });

  // Delete user (cannot delete yourself)
  app.delete('/api/users/:id', authenticate, requireRole('superadmin'), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (req.user?.userId === userId) {
        return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri' });
      }
      await db.delete(schema.users).where(eq(schema.users.id, userId));
      res.json({ success: true, message: 'User deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to delete user' });
    }
  });

  // ========== DATABASE API ENDPOINTS ==========

  // Settings API
  app.get('/api/settings', async (req, res) => {
    try {
      const rows = await db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1);
      const defaultSettings = {
        id: 1,
        contactTitle: 'Hubungi IAI Wilayah DKI Jakarta',
        contactDescription: 'Punya pertanyaan mengenai kemitraan webinar, atau ingin bergabung dengan kepengurusan generasi berikutnya? Kami siap menyambut Anda.',
        address: 'Jl. Menteng Raya No. 29, Menteng, Jakarta Pusat, DKI Jakarta 10310',
        email: 'iaimuda.dki@iai.or.id / dki@iaiglobal.or.id',
        phone: '(021) 3190-4232 ext. 202',
        showPhone: true,
        instagramUrl: 'https://instagram.com/iai_muda_dki',
        linkedinUrl: 'https://linkedin.com/company/iai-muda-dki',
        youtubeUrl: 'https://youtube.com/@iai_muda_dki',
      };
      res.json({ success: true, data: rows[0] || defaultSettings });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch settings' });
    }
  });

  app.put('/api/settings', authenticate, requireRole('superadmin', 'admin', 'editor'), async (req, res) => {
    try {
      const { contactTitle, contactDescription, address, email, phone, showPhone, instagramUrl, linkedinUrl, youtubeUrl } = req.body;
      const rows = await db.select().from(schema.settings).where(eq(schema.settings.id, 1)).limit(1);
      
      if (rows.length === 0) {
        await db.insert(schema.settings).values({
          id: 1,
          contactTitle,
          contactDescription,
          address,
          email,
          phone,
          showPhone,
          instagramUrl,
          linkedinUrl,
          youtubeUrl,
        });
      } else {
        await db.update(schema.settings).set({
          contactTitle,
          contactDescription,
          address,
          email,
          phone,
          showPhone,
          instagramUrl: instagramUrl || undefined,
          linkedinUrl: linkedinUrl || undefined,
          youtubeUrl: youtubeUrl || undefined,
        }).where(eq(schema.settings.id, 1));
      }
      
      res.json({ success: true, message: 'Settings updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update settings' });
    }
  });

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

  // Articles API
  app.get('/api/articles', async (req, res) => {
    try {
      const articles = await db.select().from(schema.articles).orderBy(schema.articles.date);
      res.json({ success: true, data: articles });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch articles' });
    }
  });

  app.get('/api/articles/:id', async (req, res) => {
    try {
      const article = await db.select().from(schema.articles).where(eq(schema.articles.id, parseInt(req.params.id))).limit(1);
      if (!article.length) {
        return res.status(404).json({ success: false, message: 'Article not found' });
      }
      res.json({ success: true, data: article[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch article' });
    }
  });

  // Galleries API
  app.get('/api/galleries', async (req, res) => {
    try {
      const rows = await db.select().from(schema.galleries).orderBy(schema.galleries.date);
      const galleries = rows.map(g => ({
        ...g,
        images: g.images ? JSON.parse(g.images) : [],
      }));
      res.json({ success: true, data: galleries });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch galleries' });
    }
  });

  app.get('/api/galleries/:id', async (req, res) => {
    try {
      const row = await db.select().from(schema.galleries).where(eq(schema.galleries.id, parseInt(req.params.id))).limit(1);
      if (!row.length) {
        return res.status(404).json({ success: false, message: 'Gallery not found' });
      }
      const gallery = { ...row[0], images: row[0].images ? JSON.parse(row[0].images) : [] };
      res.json({ success: true, data: gallery });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch gallery' });
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
      let query = db
        .select({
          id: schema.members.id,
          generationId: schema.members.generationId,
          positionId: schema.members.positionId,
          name: schema.members.name,
          division: schema.members.division,
          university: schema.members.university,
          email: schema.members.email,
          imageUrl: schema.members.imageUrl,
          linkedinUrl: schema.members.linkedinUrl,
          bio: schema.members.bio,
          isActive: schema.members.isActive,
          createdAt: schema.members.createdAt,
          updatedAt: schema.members.updatedAt,
          position: schema.positions.name,
        })
        .from(schema.members)
        .leftJoin(schema.positions, eq(schema.members.positionId, schema.positions.id));
      
      if (generationId) {
        query = query.where(eq(schema.members.generationId, generationId)) as any;
      }
      
      const rows = await query.orderBy(schema.members.id);
      const members = rows.map((row) => ({
        ...row,
        position: row.position || '',
      }));
      res.json({ success: true, data: members });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch members' });
    }
  });

  app.get('/api/members/:id', async (req, res) => {
    try {
      const rows = await db
        .select({
          id: schema.members.id,
          generationId: schema.members.generationId,
          positionId: schema.members.positionId,
          name: schema.members.name,
          division: schema.members.division,
          university: schema.members.university,
          email: schema.members.email,
          imageUrl: schema.members.imageUrl,
          linkedinUrl: schema.members.linkedinUrl,
          bio: schema.members.bio,
          isActive: schema.members.isActive,
          createdAt: schema.members.createdAt,
          updatedAt: schema.members.updatedAt,
          position: schema.positions.name,
        })
        .from(schema.members)
        .leftJoin(schema.positions, eq(schema.members.positionId, schema.positions.id))
        .where(eq(schema.members.id, parseInt(req.params.id)))
        .limit(1);
      if (!rows.length) {
        return res.status(404).json({ success: false, message: 'Member not found' });
      }
      const member = { ...rows[0], position: rows[0].position || '' };
      res.json({ success: true, data: member });
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

  // Pillars API (public read)
  app.get('/api/pillars', async (req, res) => {
    try {
      const pillars = await db.select().from(schema.pillars).orderBy(schema.pillars.sortOrder);
      res.json({ success: true, data: pillars });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch pillars' });
    }
  });

  app.get('/api/pillars/:id', async (req, res) => {
    try {
      const pillar = await db.select().from(schema.pillars).where(eq(schema.pillars.id, parseInt(req.params.id))).limit(1);
      if (!pillar.length) {
        return res.status(404).json({ success: false, message: 'Pillar not found' });
      }
      res.json({ success: true, data: pillar[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch pillar' });
    }
  });

  // ========== CRUD ENDPOINTS FOR ADMIN ==========

  // Create Event
  app.post('/api/events', authenticate, requireRole('superadmin', 'admin', 'editor'), async (req, res) => {
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
  app.put('/api/events/:id', authenticate, requireRole('superadmin', 'admin', 'editor'), async (req, res) => {
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
  app.delete('/api/events/:id', authenticate, requireRole('superadmin', 'admin', 'editor'), async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      await db.delete(schema.events).where(eq(schema.events.id, eventId));
      
      res.json({ success: true, message: 'Event deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to delete event' });
    }
  });

  // Create Member
  app.post('/api/members', authenticate, requireRole('superadmin', 'admin'), async (req, res) => {
    try {
      const { generationId, positionId, name, division, university, email, imageUrl, linkedinUrl, bio, isActive } = req.body;
      
      if (!generationId || !name) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const result = await db.insert(schema.members).values({
        generationId,
        positionId: positionId || null,
        name,
        division: division || null,
        university: university || null,
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
  app.put('/api/members/:id', authenticate, requireRole('superadmin', 'admin'), async (req, res) => {
    try {
      const { generationId, positionId, name, division, university, email, imageUrl, linkedinUrl, bio, isActive } = req.body;
      const memberId = parseInt(req.params.id);

      await db.update(schema.members).set({
        generationId: generationId || undefined,
        positionId: positionId || undefined,
        name: name || undefined,
        division: division || undefined,
        university: university !== undefined ? university : undefined,
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
  app.delete('/api/members/:id', authenticate, requireRole('superadmin', 'admin'), async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      
      await db.delete(schema.members).where(eq(schema.members.id, memberId));
      
      res.json({ success: true, message: 'Member deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to delete member' });
    }
  });

  // Create Pillar
  app.post('/api/pillars', authenticate, requireRole('superadmin', 'admin'), async (req, res) => {
    try {
      const { title, description, iconName, sortOrder } = req.body;
      if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
      const result = await db.insert(schema.pillars).values({
        title,
        description,
        iconName: iconName || 'Shield',
        sortOrder: sortOrder || 0,
      });
      res.json({ success: true, message: 'Pillar created successfully', id: (result as any).insertId });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create pillar' });
    }
  });

  // Update Pillar
  app.put('/api/pillars/:id', authenticate, requireRole('superadmin', 'admin'), async (req, res) => {
    try {
      const { title, description, iconName, sortOrder } = req.body;
      const pillarId = parseInt(req.params.id);
      await db.update(schema.pillars).set({
        title: title || undefined,
        description: description || undefined,
        iconName: iconName || undefined,
        sortOrder: sortOrder !== undefined ? sortOrder : undefined,
      }).where(eq(schema.pillars.id, pillarId));
      res.json({ success: true, message: 'Pillar updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update pillar' });
    }
  });

  // Delete Pillar
  app.delete('/api/pillars/:id', authenticate, requireRole('superadmin', 'admin'), async (req, res) => {
    try {
      const pillarId = parseInt(req.params.id);
      await db.delete(schema.pillars).where(eq(schema.pillars.id, pillarId));
      res.json({ success: true, message: 'Pillar deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to delete pillar' });
    }
  });

  // Create Article
  app.post('/api/articles', authenticate, requireRole('superadmin', 'admin', 'editor'), async (req, res) => {
    try {
      const { title, excerpt, content, date, author, imageUrl } = req.body;

      if (!title || !content || !date || !author) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const result = await db.insert(schema.articles).values({
        title,
        excerpt: excerpt || null,
        content,
        date,
        author,
        imageUrl: imageUrl || null,
      });

      res.json({ success: true, message: 'Article created successfully', id: (result as any).insertId });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create article' });
    }
  });

  // Update Article
  app.put('/api/articles/:id', authenticate, requireRole('superadmin', 'admin', 'editor'), async (req, res) => {
    try {
      const { title, excerpt, content, date, author, imageUrl } = req.body;
      const articleId = parseInt(req.params.id);

      await db.update(schema.articles).set({
        title: title || undefined,
        excerpt: excerpt !== undefined ? excerpt : undefined,
        content: content || undefined,
        date: date || undefined,
        author: author || undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      }).where(eq(schema.articles.id, articleId));

      res.json({ success: true, message: 'Article updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update article' });
    }
  });

  // Delete Article
  app.delete('/api/articles/:id', authenticate, requireRole('superadmin', 'admin', 'editor'), async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);

      await db.delete(schema.articles).where(eq(schema.articles.id, articleId));

      res.json({ success: true, message: 'Article deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to delete article' });
    }
  });

  // Create Gallery
  app.post('/api/galleries', authenticate, requireRole('superadmin', 'admin', 'editor'), async (req, res) => {
    try {
      const { title, description, imageUrl, date, category, photographer, images } = req.body;

      if (!title || !date) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const result = await db.insert(schema.galleries).values({
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        date,
        category: category || null,
        photographer: photographer || null,
        images: images ? JSON.stringify(images) : null,
      });

      res.json({ success: true, message: 'Gallery created successfully', id: (result as any).insertId });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to create gallery' });
    }
  });

  // Update Gallery
  app.put('/api/galleries/:id', authenticate, requireRole('superadmin', 'admin', 'editor'), async (req, res) => {
    try {
      const { title, description, imageUrl, date, category, photographer, images } = req.body;
      const galleryId = parseInt(req.params.id);

      await db.update(schema.galleries).set({
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        date: date || undefined,
        category: category !== undefined ? category : undefined,
        photographer: photographer !== undefined ? photographer : undefined,
        images: images !== undefined ? JSON.stringify(images) : undefined,
      }).where(eq(schema.galleries.id, galleryId));

      res.json({ success: true, message: 'Gallery updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to update gallery' });
    }
  });

  // Delete Gallery
  app.delete('/api/galleries/:id', authenticate, requireRole('superadmin', 'admin', 'editor'), async (req, res) => {
    try {
      const galleryId = parseInt(req.params.id);

      await db.delete(schema.galleries).where(eq(schema.galleries.id, galleryId));

      res.json({ success: true, message: 'Gallery deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to delete gallery' });
    }
  });

  // Create Generation
  app.post('/api/generations', authenticate, requireRole('superadmin'), async (req, res) => {
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
  app.put('/api/generations/:id', authenticate, requireRole('superadmin'), async (req, res) => {
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
  app.delete('/api/generations/:id', authenticate, requireRole('superadmin'), async (req, res) => {
    try {
      const genId = parseInt(req.params.id);
      
      await db.delete(schema.generations).where(eq(schema.generations.id, genId));
      
      res.json({ success: true, message: 'Generation deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to delete generation' });
    }
  });

  // Create Position
  app.post('/api/positions', authenticate, requireRole('superadmin'), async (req, res) => {
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
  app.put('/api/positions/:id', authenticate, requireRole('superadmin'), async (req, res) => {
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
  app.delete('/api/positions/:id', authenticate, requireRole('superadmin'), async (req, res) => {
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
