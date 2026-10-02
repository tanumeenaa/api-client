   import mongoose from 'mongoose';

   const SavedRequestSchema = new mongoose.Schema({
     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     name: { type: String, required: true }, 
     method: { type: String, required: true },
     url: { type: String, required: true },
     headers: { type: Array, default: [] },
     body: { type: String, default: '' },
     createdAt: { type: Date, default: Date.now }
   });

   export default mongoose.model('SavedRequest', SavedRequestSchema);