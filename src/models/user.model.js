import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema ({
    googleId: {
        type: String,
        required: false,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function(){return !this.googleId;}
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

const User = mongoose.model('User',userSchema);
export default User;