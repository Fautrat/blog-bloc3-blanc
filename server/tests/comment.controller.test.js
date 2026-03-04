jest.mock('../config/db', () => ({
    pool: { query: jest.fn() }
}));
const { pool } = require('../config/db');
const commentController = require('../controllers/comment.controller');

describe('comment.controller', () => {
    let req, res;

    beforeEach(() => {
        req = { params: {}, body: {}, userId: 1 };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        pool.query.mockReset();
    });

    test('getArticleComments returns comments', async () => {
        const rows = [{ id: 1, content: 'Hi', username: 'u', avatar: null, created_at: '2026-03-04 12:00:00' }];
        pool.query.mockResolvedValueOnce([rows]);
        req.params.articleId = 1;

        await commentController.getArticleComments(req, res);

        expect(res.json).toHaveBeenCalledWith(rows);
    });

    test('createComment returns created comment meta', async () => {
        req.params.articleId = 2;
        req.body.content = 'New comment';
        req.userId = 7;

        pool.query.mockResolvedValueOnce([{ insertId: 42 }]);

        await commentController.createComment(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ id: 42, content: 'New comment', article_id: 2, user_id: 7 });
    });
});
