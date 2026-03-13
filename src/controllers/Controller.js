const prisma = require("../utils/prismaClient");
const fs = require("fs");
const path = require("path");

// CREATE
const createNews = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const file = req.file; // From Multer

    if(!title | !author || !content)
      return res.status(400).json({
        success: false,
        message: "Please input the required fields!"
      });

    const News = await prisma.news.create({
      data: {
        title,
        content,
        author,
        thumbnail: file ? file.path : null, // Save path to DB
        published: false,
      },
    });

    res.status(201).json({ message: "News created successfully", data: News });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ
const getPublishedNews = async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      where: {published: true},
      orderBy: {createdAt: "desc"}
    });

    res.status(200).json({
      data: news,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, author } = req.body;
    const file = req.file;

    // Find existing News to get old image path
    const oldNews = await prisma.news.findUnique({
      where: { id: parseInt(id) },
    });

    if (!oldNews)
      return res.status(404).json({ message: "News not found" });

    let imagePath = oldNews.thumbnail;

    // If new file uploaded, delete old one and update path
    if (file) {
      if (oldNews.thumbnail) {
        const oldPath = path.join(__dirname, "../../", oldNews.thumbnail);
        if (fs.existsSync(oldPath)) 
          fs.unlinkSync(oldPath); // Delete old file
      }

      imagePath = file.path;
    }

    const updatedNews = await prisma.news.update({
      where: { id: parseInt(id) },
      data: {
        title, 
        content, 
        author,
        thumbnail: imagePath,
      },
    });

    res.status(200).json({ message: "News updated", data: updatedNews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await prisma.news.findUnique({
      where: { id: parseInt(id) },
    });

    if (!news) 
      return res.status(404).json({ message: "News not found" });

    // Delete image from server
    if (news.image) {
      const filePath = path.join(__dirname, "../../", news.image);

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.news.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE PUBLISHED STATUS
const publishNews  = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the specific news through the id
    const news = await prisma.news.findUnique({
      where: { id: parseInt(id) },
    });

    if (!news)
      return res.status(404).json({ message: "News not found" });

    const updatedNews = await prisma.news.update({
      where: { id: parseInt(id) },
      data: {
        published: true
      },
    });

    res.status(200).json({ message: "News published successfully", data: updatedNews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SEARCH NEWS BASED ON THE TITLE
const searchNews = async (req, res) => {
  try {
    const { title } = req.query;
    const news = await prisma.news.findMany({
      where: {
        title: {
          contains: title
        },
      },
    });
    res.status(200).json({ data: news });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createNews,
  getPublishedNews,
  updateNews,
  deleteNews,
  publishNews,
  searchNews
};
