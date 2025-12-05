const prisma = require('../utils/prismaClient');
const fs = require('fs');
const path = require('path');

// CREATE
exports.createProduct = async (req, res) => {
    try {
        const { name, price, categoryId, description } = req.body;
        const file = req.file; // From Multer

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                categoryId: parseInt(categoryId),
                image: file ? file.path : null // Save path to DB
            }
        });

        res.status(201).json({ message: 'Product created', data: product });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// READ
exports.getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const products = await prisma.product.findMany({
            skip: parseInt(skip),
            take: parseInt(limit),
            include: { category: true } // Relationship
        });

        const totalData = await prisma.product.count();

        res.status(200).json({
            data: products,
            meta: {
                totalData,
                page: parseInt(page),
                totalPages: Math.ceil(totalData / limit)
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;
        const file = req.file;

        // Find existing product to get old image path
        const oldProduct = await prisma.product.findUnique({ where: { id: parseInt(id) } });

        if (!oldProduct) 
            return res.status(404).json({ message: 'Product not found' });

        let imagePath = oldProduct.image;

        // If new file uploaded, delete old one and update path
        if (file) {
            if (oldProduct.image) {
                const oldPath = path.join(__dirname, '../../', oldProduct.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); // Delete old file
            }

            imagePath = file.path;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                price: price ? parseFloat(price) : undefined,
                description,
                image: imagePath
            }
        });

        res.status(200).json({ message: 'Product updated', data: updatedProduct });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });

        if (!product) 
            return res.status(404).json({ message: 'Product not found' });

        // Delete image from server
        if (product.image) {
            const filePath = path.join(__dirname, '../../', product.image);

            if (fs.existsSync(filePath)) 
                fs.unlinkSync(filePath);
        }

        await prisma.product.delete({ where: { id: parseInt(id) } });

        res.status(200).json({ message: 'Product deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};