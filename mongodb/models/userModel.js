import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    reqlimit: {
        type: Number
    }
});

export default mongoose.model('user', userSchema);
