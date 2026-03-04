jest.mock('../config/db', () => ({
    pool: { query: jest.fn() }
}));
const { pool } = require('../config/db');
const authController = require('../controllers/auth.controller');
const bcrypt = require('bcryptjs');

describe('auth.controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn()
        };
        pool.query.mockReset();
    });

    test('register returns 400 for weak password', async () => {
        req.body = { username: 'u', email: 'a@b.com', password: 'weak' };
        await authController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
    });

    test('register succeeds with valid password and no existing user', async () => {
        req.body = { username: 'u', email: 'a@b.com', password: 'StrongPass1!' };
        // first query: check existing -> empty rows
        pool.query.mockResolvedValueOnce([[]]);
        // second query: insert -> result object
        pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
    });

    test('login succeeds with correct credentials', async () => {
        const password = 'Password1!';
        const hashed = bcrypt.hashSync(password, 10);
        req.body = { email: 'test@x.com', password };

        // pool.query should return rows array with user
        pool.query.mockResolvedValueOnce([[{ id: 5, username: 'tester', email: req.body.email, password: hashed, avatar: null }]]);

        await authController.login(req, res);

        expect(res.json).toHaveBeenCalled();
        const payload = res.json.mock.calls[0][0];
        expect(payload).toHaveProperty('user');
        expect(payload.user.email).toBe(req.body.email);
    });
});
