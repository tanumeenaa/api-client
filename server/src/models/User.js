import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SavedRequest' }] 
});

export default mongoose.model('User', UserSchema);