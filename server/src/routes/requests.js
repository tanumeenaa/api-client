   import express from 'express';
   import SavedRequest from '../models/SavedRequest.js';
   import { verifyToken } from '../middleware/auth.js';

   const router = express.Router();

   router.post('/', verifyToken, async (req, res) => {
     try {
       const { name, method, url, headers, body } = req.body;
       const newRequest = new SavedRequest({
         userId: req.user.userId,
         name,
         method,
         url,
         headers: headers || [],
         body: body || ''
       });
       await newRequest.save();
       res.status(201).json({ message: 'Request saved successfully', request: newRequest });
     } catch (err) {
       console.error('Save request error:', err);
       res.status(500).json({ error: 'Failed to save request' });
     }
   });

   router.get('/', verifyToken, async (req, res) => {
     try {
       const requests = await SavedRequest.find({ userId: req.user.userId }).sort({ createdAt: -1 });
       res.json(requests);
     } catch (err) {
       console.error('Get requests error:', err);
       res.status(500).json({ error: 'Failed to fetch saved requests' });
     }
   });

   export default router;