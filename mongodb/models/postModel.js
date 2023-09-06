import mongoose from 'mongoose';

const { Schema } = mongoose;

const postSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    prompt: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: true,
    },
});

export default mongoose.model('Post', postSchema);