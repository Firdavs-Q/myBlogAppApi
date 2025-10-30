const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// MongoDB ulanish (Atlas uchun .env dan)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myBlogApp')
  .then(() => console.log('MongoDB ulandi (myBlogApp)'))
  .catch(err => console.error('MongoDB xatosi:', err));

// Inline Schema'lar va Modellar (har kolleksiya uchun)
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  image: { type: String },
  likes: { type: Number, default: 0 }
}, { timestamps: true });
const NewsModel = mongoose.model('NewsPageCardData', newsSchema, 'yangiliklarPageCardData');

const videosSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  videoUrl: { type: String, required: true },
  likes: { type: Number, default: 0 }
}, { timestamps: true });
const VideosModel = mongoose.model('VideosPageCardData', videosSchema, 'videolarPageCardData');

const materialsVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  downloadUrl: { type: String, required: true },
  likes: { type: Number, default: 0 }
}, { timestamps: true });
const MaterialsVideoModel = mongoose.model('MaterialsVideoPageCardData', materialsVideoSchema, 'materiallarPageVideoCardData');

const materialsSuratSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  downloadUrl: { type: String, required: true },
  likes: { type: Number, default: 0 }
}, { timestamps: true });
const MaterialsSuratModel = mongoose.model('MaterialsSuratPageCardData', materialsSuratSchema, 'materiallarPageSuratCardData');

const materialsAudioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  downloadUrl: { type: String, required: true },
  likes: { type: Number, default: 0 }
}, { timestamps: true });
const MaterialsAudioModel = mongoose.model('MaterialsAudioPageCardData', materialsAudioSchema, 'materiallarPageAudioCardData');

const materialsMatnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  downloadUrl: { type: String, required: true },
  likes: { type: Number, default: 0 }
}, { timestamps: true });
const MaterialsMatnModel = mongoose.model('MaterialsMatnPageCardData', materialsMatnSchema, 'materiallarPageMatnCardData');

const adminSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String },
  url: { type: String },
  handle: { type: String },
  highlight: { type: Boolean, default: false },
  likes: { type: Number, default: 0 }
}, { timestamps: true });
const AdminModel = mongoose.model('AdminPageCardData', adminSchema, 'adminPageCardData');

const commentSchema = new mongoose.Schema({
  message: { type: String, required: true },
  itemType: { type: String, required: true }, // 'general' yoki 'video' – belgi
  itemId: { type: String, default: '' }
}, { timestamps: true });
const CommentModel = mongoose.model('ProfilPageCommentData', commentSchema, 'profilPageCommentData');

  // Umumiy Handler Funksiyalari (kodni qisqartirish uchun)
  const getAll = async (Model) => {
    try {
      return await Model.find().sort({ createdAt: -1 });
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const postOne = async (Model, body) => {
    try {
      const newItem = new Model(body);
      await newItem.save();
      return newItem;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const updateOne = async (Model, id, body) => {
    try {
      const updated = await Model.findByIdAndUpdate(id, body, { new: true });
      if (!updated) throw new Error('Topilmadi');
      return updated;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // "/" Route – Barcha ma'lumotlar alohida arraylarda (kollksiyalardan) – haqiqiy API kabi
  app.get('/', async (req, res) => {
    try {
      // Alohida kolleksiyalardan ma'lumot olish – har biri alohida array
      const news = await getAll(NewsModel);
      const videos = await getAll(VideosModel);
      const materials = {
        video: await getAll(MaterialsVideoModel),
        surat: await getAll(MaterialsSuratModel),
        audio: await getAll(MaterialsAudioModel),
        matn: await getAll(MaterialsMatnModel),
      };
      const admin = await getAll(AdminModel);
      const comments = await getAll(CommentModel);

      // Javob – alohida arraylar bilan (haqiqiy API formatida)
      const response = {
        success: true,
        data: {
          news: news.map(item => item.toObject()).value(),
          videos: videos.map(item => item.toObject()).value(),
          materials: materials,
          admin: admin.map(item => item.toObject()).value(),
          comments: comments.map(item => item.toObject()).value(),
        },
        summary: {
          totalNews: news.length,
          totalVideos: videos.length,
          totalMaterials: Object.values(materials).reduce((acc, curr) => acc + curr.length, 0),
          totalAdmin: admin.length,
          totalComments: comments.length,
        }
      };

      res.json(response);
    } catch (err) {
      console.error('Root route xatosi: $err');
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Yangiliklar
  app.get('/api/newsPageCardData', async (req, res) => {
    try {
      const data = await getAll(NewsModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/newsPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(NewsModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/newsPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(NewsModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/newsPageCardData/:id', async (req, res) => {
    try {
      const deleted = await NewsModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Videolar
  app.get('/api/videosPageCardData', async (req, res) => {
    try {
      const data = await getAll(VideosModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/videosPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(VideosModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/videosPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(VideosModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/videosPageCardData/:id', async (req, res) => {
    try {
      const deleted = await VideosModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Videolar
  app.get('/api/materialsVideoPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsVideoModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/materialsVideoPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(MaterialsVideoModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/materialsVideoPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(MaterialsVideoModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/materialsVideoPageCardData/:id', async (req, res) => {
    try {
      const deleted = await MaterialsVideoModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Suratlar
  app.get('/api/materialsSuratPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsSuratModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/videosPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(VideosModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/videosPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(VideosModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/videosPageCardData/:id', async (req, res) => {
    try {
      const deleted = await VideosModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Videolar
  app.get('/api/materialsVideoPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsVideoModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/materialsVideoPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(MaterialsVideoModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/materialsVideoPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(MaterialsVideoModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/materialsVideoPageCardData/:id', async (req, res) => {
    try {
      const deleted = await MaterialsVideoModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Suratlar
  app.get('/api/materialsSuratPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsSuratModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/materialsSuratPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(MaterialsSuratModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/videosPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(VideosModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/videosPageCardData/:id', async (req, res) => {
    try {
      const deleted = await VideosModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Videolar
  app.get('/api/materialsVideoPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsVideoModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/materialsVideoPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(MaterialsVideoModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/materialsVideoPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(MaterialsVideoModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/materialsVideoPageCardData/:id', async (req, res) => {
    try {
      const deleted = await MaterialsVideoModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Suratlar
  app.get('/api/materialsSuratPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsSuratModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/materialsSuratPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(MaterialsSuratModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/materialsSuratPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(MaterialsSuratModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/materialsSuratPageCardData/:id', async (req, res) => {
    try {
      const deleted = await MaterialsSuratModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Audios
  app.get('/api/materialsAudioPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsAudioModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/videosPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(VideosModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/videosPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(VideosModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/videosPageCardData/:id', async (req, res) => {
    try {
      const deleted = await VideosModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Videolar
  app.get('/api/materialsVideoPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsVideoModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/materialsVideoPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(MaterialsVideoModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/materialsVideoPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(MaterialsVideoModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/materialsVideoPageCardData/:id', async (req, res) => {
    try {
      const deleted = await MaterialsVideoModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Suratlar
  app.get('/api/materialsSuratPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsSuratModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/materialsSuratPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(MaterialsSuratModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/materialsSuratPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(MaterialsSuratModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/materialsSuratPageCardData/:id', async (req, res) => {
    try {
      const deleted = await MaterialsSuratModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Audios
  app.get('/api/materialsAudioPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsAudioModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/materialsAudioPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(MaterialsAudioModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/materialsAudioPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(MaterialsAudioModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/materialsAudioPageCardData/:id', async (req, res) => {
    try {
      const deleted = await MaterialsAudioModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Matnlar
  app.get('/api/materialsMatnPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsMatnModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

    app.post('/api/materialsSuratPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(MaterialsSuratModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/materialsSuratPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(MaterialsSuratModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/materialsSuratPageCardData/:id', async (req, res) => {
    try {
      const deleted = await MaterialsSuratModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Audios
  app.get('/api/materialsAudioPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsAudioModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/materialsAudioPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(MaterialsAudioModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/materialsAudioPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(MaterialsAudioModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/materialsAudioPageCardData/:id', async (req, res) => {
    try {
      const deleted = await MaterialsAudioModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Material Matnlar
  app.get('/api/materialsMatnPageCardData', async (req, res) => {
    try {
      const data = await getAll(MaterialsMatnModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

 app.post('/api/materialsMatnPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(MaterialsMatnModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/materialsMatnPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(MaterialsMatnModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/materialsMatnPageCardData/:id', async (req, res) => {
    try {
      const deleted = await MaterialsMatnModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Admin
  app.get('/api/adminPageCardData', async (req, res) => {
    try {
      const data = await getAll(AdminModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/adminPageCardData', async (req, res) => {
    try {
      const newItem = await postOne(AdminModel, req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/adminPageCardData/:id', async (req, res) => {
    try {
      const updated = await updateOne(AdminModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/adminPageCardData/:id', async (req, res) => {
    try {
      const deleted = await AdminModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // Kommentariyalar
  app.get('/api/profilPageCommentData', async (req, res) => {
    try {
      const data = await getAll(CommentModel);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/profilPageCommentData', async (req, res) => {
    try {
      const newComment = await postOne(CommentModel, req.body);
      res.status(201).json({ success: true, data: newComment });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/profilPageCommentData/:id', async (req, res) => {
    try {
      const updated = await updateOne(CommentModel, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/profilPageCommentData/:id', async (req, res) => {
    try {
      const deleted = await CommentModel.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error('Topilmadi');
      res.json({ success: true, message: 'O\'chirildi' });
    } catch (err) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // 404 Handler – Har qanday boshqa route uchun
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint topilmadi' });
  });

  // Server ishga tushirish
  app.listen(PORT, () => {
    console.log(`Server ${PORT} portda ishlamoqda`);
    console.log('Test uchun: http://localhost:${PORT}/api/newsPageCardData');
  });