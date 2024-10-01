const { Router } = require('express');
const multer = require('multer');
const path = require('path');

const Blog = require('../models/blog');
const Comment = require('../models/comments');
const { authenticate } = require('../middlewares/authentication')

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads`));
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}_ ${file.originalname}`;
      cb(null, fileName);
    }
  });
  
  const upload = multer({ storage: storage })

router.get('/add-new', (req, res) => {
    return res.render('addBlog', {
        user: req.user,
    });
})

router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate('createdBy');
    const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy');
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
    console.log(comments);
    return res.render('blog', {
        user: req.user,
        blog,
        comments,
        blogs: allBlogs,
    });
});

router.post('/', upload.single('coverImage'), async (req, res) => {
    const { title, body } = req.body;
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`
    });
    return res.redirect(`/blog/${blog._id}`);
})

router.post('/comment/:blogId', async (req, res) => {
    try {
        const comment = await Comment.create({
            content: req.body.content,
            blogId: req.params.blogId,
            createdBy: req.user._id,
        });
        return res.redirect(`/blog/${req.params.blogId}`);
    } catch (error) {
        console.error('Error saving comment:', error);
        return res.status(500).send('Error saving comment');
    }
});

router.delete('/blogs/:id', authenticate, async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await Blog.findById(blogId);

        // Check if the user is authorized to delete the blog
        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Blog.findByIdAndDelete(blogId);
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting blog', error });
    }
});


module.exports = router;