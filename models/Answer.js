const mongoose = require('mongoose');
const Question = require('./Questions');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    content: {
        type: String,
        required: [true, 'Please provide a content'],
        minlength: [10, 'Please provide a content at least 10 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: mongoose.Schema.ObjectId,
        ref: 'Question',
        required: true
    }
});

AnswerSchema.pre('save', async function() {
    if (!this.isModified('user')) return;

    const question = await Question.findById(this.question);
    if (!question) {
        throw new Error('Question not found for this answer');
    }

    const alreadyLinked = question.answers.some(
        (id) => id.toString() === this._id.toString()
    );
    if (!alreadyLinked) {
        question.answers.push(this._id);
    }
    question.answersCount = question.answers.length;
    await question.save();
});

module.exports = mongoose.model('Answer', AnswerSchema);
