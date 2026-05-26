

describe('chatController', () => {
    let chatController;
    let dbQuery;

    beforeEach(() => {
        vi.resetModules();
        dbQuery = vi.fn();

        const dbPath = require.resolve('../config/db');
        require.cache[dbPath] = {
            exports: { query: dbQuery }
        };

        delete require.cache[require.resolve('./chatController')];
        chatController = require('./chatController');
    });

    const mockRes = () => {
        const res = {};
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        return res;
    };

    describe('getMessageHistory', () => {
        it('fetches support history for customer', async () => {
            const req = { params: { otherUserId: 'SUPPORT' }, user: { id: 'u1', role: 'Customer' } };
            const res = mockRes();

            dbQuery.mockResolvedValueOnce({ rows: [{ id: 1, message: 'Hello' }] });

            await chatController.getMessageHistory(req, res);

            expect(dbQuery).toHaveBeenCalledWith(
                expect.stringContaining('sender_id = $1 AND receiver_id IS NULL'),
                ['u1']
            );
            expect(res.json).toHaveBeenCalledWith([{ id: 1, message: 'Hello' }]);
        });

        it('fetches history for staff querying a customer', async () => {
            const req = { params: { otherUserId: 'c1' }, user: { id: 'admin1', role: 'Admin' } };
            const res = mockRes();

            dbQuery.mockResolvedValueOnce({ rows: [{ id: 2, message: 'Hi' }] });

            await chatController.getMessageHistory(req, res);

            expect(dbQuery).toHaveBeenCalledWith(
                expect.stringContaining('sender_id = $1 AND (receiver_id IS NULL'),
                ['c1']
            );
            expect(res.json).toHaveBeenCalledWith([{ id: 2, message: 'Hi' }]);
        });

        it('fetches standard DM between non-staff', async () => {
            const req = { params: { otherUserId: 'u2' }, user: { id: 'u1', role: 'Customer' } };
            const res = mockRes();

            dbQuery.mockResolvedValueOnce({ rows: [{ id: 3, message: 'Yo' }] });

            await chatController.getMessageHistory(req, res);

            expect(dbQuery).toHaveBeenCalledWith(
                expect.stringContaining('(sender_id = $1 AND receiver_id = $2)'),
                ['u1', 'u2']
            );
            expect(res.json).toHaveBeenCalledWith([{ id: 3, message: 'Yo' }]);
        });

        it('handles errors', async () => {
            const req = { params: { otherUserId: 'SUPPORT' }, user: { id: 'u1', role: 'Customer' } };
            const res = mockRes();

            dbQuery.mockRejectedValueOnce(new Error('DB Error'));

            await chatController.getMessageHistory(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error fetching chat history' });
        });
    });

    describe('getConversations', () => {
        it('fetches conversations correctly', async () => {
            const req = {};
            const res = mockRes();

            dbQuery.mockResolvedValueOnce({ rows: [{ id: 'u1', name: 'User 1', last_message: 'Test' }] });

            await chatController.getConversations(req, res);

            expect(dbQuery).toHaveBeenCalledWith(expect.stringContaining('WITH last_messages AS'));
            expect(res.json).toHaveBeenCalledWith([{ id: 'u1', name: 'User 1', last_message: 'Test' }]);
        });

        it('handles errors', async () => {
            const req = {};
            const res = mockRes();

            dbQuery.mockRejectedValueOnce(new Error('DB Error'));

            await chatController.getConversations(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
