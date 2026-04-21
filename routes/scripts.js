const express = require('express');
const router = express.Router();
const Script = require('../models/Script');
const ScriptVersion = require('../models/ScriptVersion');

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

// ─── VERSION ROUTES (MUST BE BEFORE :id ROUTE) ───

// GET /api/scripts/:id/versions - Get version history
router.get('/:id/versions', async (req, res) => {
  try {
    const script = await Script.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { isPublic: true }]
    });

    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }

    const versions = await ScriptVersion.find({ scriptId: req.params.id })
      .populate('author', 'username')
      .sort({ versionNumber: -1 });

    res.json({ versions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// GET /api/scripts/:id/versions/:versionNumber - Get specific version
router.get('/:id/versions/:versionNumber', async (req, res) => {
  try {
    const script = await Script.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { isPublic: true }]
    });

    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }

    const version = await ScriptVersion.findOne({
      scriptId: req.params.id,
      versionNumber: parseInt(req.params.versionNumber)
    }).populate('author', 'username');

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json({ version });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch version' });
  }
});

// POST /api/scripts/:id/revert/:versionNumber - Revert to specific version
router.post('/:id/revert/:versionNumber', async (req, res) => {
  try {
    const script = await Script.findOne({ _id: req.params.id, owner: req.user._id });

    if (!script) {
      return res.status(404).json({ error: 'Script not found or access denied' });
    }

    const version = await ScriptVersion.findOne({
      scriptId: req.params.id,
      versionNumber: parseInt(req.params.versionNumber)
    });

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Save current version before reverting
    const currentVersionCount = await ScriptVersion.countDocuments({ scriptId: script._id });
    const currentVersion = new ScriptVersion({
      scriptId: script._id,
      code: script.code,
      title: script.title,
      description: script.description,
      language: script.language,
      tags: script.tags,
      versionNumber: currentVersionCount + 1,
      author: req.user._id,
      message: `Reverted from v${version.versionNumber}`
    });
    await currentVersion.save();

    // Restore the old version
    script.code = version.code;
    script.title = version.title;
    script.description = version.description;
    script.language = version.language;
    script.tags = version.tags;
    await script.save();

    res.json({ message: `Reverted to version ${version.versionNumber}`, script });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revert script' });
  }
});

// ─── END VERSION ROUTES ───

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

    const { title, description, code, language, tags, isPublic, commitMessage } = req.body;
    const codeChanged = code !== undefined && code !== script.code;

    // Create version if code changed
    if (codeChanged) {
      const versionCount = await ScriptVersion.countDocuments({ scriptId: script._id });
      const version = new ScriptVersion({
        scriptId: script._id,
        code: script.code,
        title: script.title,
        description: script.description,
        language: script.language,
        tags: script.tags,
        versionNumber: versionCount + 1,
        author: req.user._id,
        message: commitMessage || 'Updated script'
      });
      await version.save();
    }

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
