const { pool } = require('../config/db');

exports.getArticleComments = async (req, res) => {
    try {
        const [comments] = await pool.query(`
            SELECT comments.*, users.username, users.avatar 
            FROM comments 
            JOIN users ON comments.user_id = users.id 
            WHERE article_id = ? 
            ORDER BY created_at DESC
        `, [req.params.articleId]);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const articleId = req.params.articleId;
        
        const [result] = await pool.query(
            'INSERT INTO comments (content, article_id, user_id) VALUES (?, ?, ?)',
            [content, articleId, req.userId]
        );
        res.status(201).json({ id: result.insertId, content, article_id: articleId, user_id: req.userId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const commentId = req.params.id;

        // Vérification de la propriété
        const [comments] = await pool.query('SELECT * FROM comments WHERE id = ?', [commentId]);
        if (comments.length === 0) return res.status(404).json({ message: 'Commentaire introuvable' });
        if (comments[0].user_id !== req.userId) return res.status(403).json({ message: 'Non autorisé' });

        await pool.query('UPDATE comments SET content = ? WHERE id = ?', [content, commentId]);
        res.json({ message: 'Commentaire mis à jour' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;

        // Vérification de la propriété
        const [comments] = await pool.query('SELECT * FROM comments WHERE id = ?', [commentId]);
        if (comments.length === 0) return res.status(404).json({ message: 'Commentaire introuvable' });
        if (comments[0].user_id !== req.userId) return res.status(403).json({ message: 'Non autorisé' });

        await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);
        res.json({ message: 'Commentaire supprimé' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};