const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const Question = require('./Questions');
const Answer = require('./Answer');

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name']
    },
    email: {
        type: String,
        required: [true, 'Please provide a e-mail'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid e-mail address.'
        ]
    },
    password: {
        type: String,
        minlength: [6, 'The password must be at least 6 characters long.'],
        required: [true, 'Please provide a password'],
        select: false
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String
    },
    about: {
        type: String
    },
    place: {
        type: String
    },
    website: {
        type: String
    },
    profile_image: {
        type: String,
        default: 'default.jpg'
    },
    blocked: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    }
});

UserSchema.methods.generateJwtFromUser = function(){
    const { JWT_SECRET_KEY, JWT_EXPIRE } = process.env;

    const payload = {
        id: this._id,
        name: this.name
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY, {
        expiresIn: (JWT_EXPIRE && JWT_EXPIRE.trim()) || '1h'
    });

    return token;
};

UserSchema.methods.getResetPasswordTokenFromUser = function() {
    const { RESET_PASSWORD_EXPIRE } = process.env;
    const randomHexString = crypto.randomBytes(15).toString('hex');

    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(randomHexString)
        .digest('hex');

    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpire = Date.now() + parseInt(RESET_PASSWORD_EXPIRE);

    return randomHexString;
};

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.post('deleteOne', { document: true, query: false }, async function () {
    const questions = await Question.find({ user: this._id }).select('_id');
    const questionIds = questions.map((question) => question._id);

    await Answer.deleteMany({
        $or: [
            { user: this._id },
            { question: { $in: questionIds } }
        ]
    });
    await Question.deleteMany({ user: this._id });
});

module.exports = mongoose.model('User', UserSchema);
