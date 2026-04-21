const express = require('express');
const router = express.Router();
const Script = require('../models/Script');

// GET /api/scripts - Get all scripts for the logged-in user
router.get('/', async (req, res) => {
  try {
    const { search, language, tag, sort = 'newest', page = 1, limit = 20 } = req.query;

    const query = { owner: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (language) query.language = language;
    if (tag) query.tags = tag;

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      updated: { updatedAt: -1 },
      title: { title: 1 }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Script.countDocuments(query);
    const scripts = await Script.find(query)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-code'); // Don't send code in list view

    res.json({
      scripts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get scripts error:', err);
    res.status(500).json({ error: 'Failed to fetch scripts' });
  }
});

// GET /api/scripts/public - Get all public scripts
router.get('/public', async (req, res) => {
  try {
    const { search, language, sort = 'newest', page = 1, limit = 20 } = req.query;
    const query = { isPublic: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (language) query.language = language;

    const sortOptions = {
      newest: { createdAt: -1 },
      popular: { views: -1 }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Script.countDocuments(query);
    const scripts = await Script.find(query)
      .populate('owner', 'username')
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-code');

    res.json({ scripts, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public scripts' });
  }
});

// GET /api/scripts/stats - Get user stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Script.countDocuments({ owner: req.user._id });
    const publicCount = await Script.countDocuments({ owner: req.user._id, isPublic: true });
    const byLanguage = await Script.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const recentScripts = await Script.find({ owner: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title language updatedAt');

    res.json({ total, publicCount, privateCount: total - publicCount, byLanguage, recentScripts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/scripts/:id - Get a single script
router.get('/:id', async (req, res) => {
  try {
    const script = await Script.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { isPublic: true }]
    }).populate('owner', 'username');

    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }

    // Increment views if not owner
    if (!script.owner._id.equals(req.user._id)) {
      script.views += 1;
      await script.save();
    }

    res.json({ script });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch script' });
  }
});

// POST /api/scripts - Create a new script
router.post('/', async (req, res) => {
  try {
    const { title, description, code, language, tags, isPublic } = req.body;

    if (!title || !code) {
      return res.status(400).json({ error: 'Title and code are required' });
    }

    const script = new Script({
      title,
      description,
      code,
      language: language || 'javascript',
      tags: tags || [],
      isPublic: isPublic || false,
      owner: req.user._id
    });

    await script.save();
    res.status(201).json({ message: 'Script created', script });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0] });
    }
    console.error('Create script error:', err);
    res.status(500).json({ error: 'Failed to create script' });
  }
});

// PUT /api/scripts/:id - Update a script
router.put('/:id', async (req, res) => {
  try {
    const script = await Script.findOne({ _id: req.params.id, owner: req.user._id });

    if (!script) {
      return res.status(404).json({ error: 'Script not found or access denied' });
    }

    const { title, description, code, language, tags, isPublic } = req.body;

    if (title !== undefined) script.title = title;
    if (description !== undefined) script.description = description;
    if (code !== undefined) script.code = code;
    if (language !== undefined) script.language = language;
    if (tags !== undefined) script.tags = tags;
    if (isPublic !== undefined) script.isPublic = isPublic;

    await script.save();
    res.json({ message: 'Script updated', script });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages[0] });
    }
    res.status(500).json({ error: 'Failed to update script' });
  }
});

// DELETE /api/scripts/:id - Delete a script
router.delete('/:id', async (req, res) => {
  try {
    const script = await Script.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!script) {
      return res.status(404).json({ error: 'Script not found or access denied' });
    }

    res.json({ message: 'Script deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete script' });
  }
});

module.exports = router;
