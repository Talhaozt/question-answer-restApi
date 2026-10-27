const mongoose = require('mongoose');
const slugify = require('slugify');
const Schema = mongoose.Schema;

const QuestionsSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        minlength: [10, 'Please provide a title at least 10 characters'],
        unique: true
    },
    content: {
        type: String,
        required: [true, 'Please provide a content'],
        minlength: [20, 'Please provide a content at least 20 characters']
    },
    slug: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    likeCount: {
        type: Number,
        default: 0
    },
    likes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    answersCount: {
        type: Number,
        default: 0
    },
    answers: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Answer'
        }
    ]
});

QuestionsSchema.pre('save', function() {
    if (!this.isModified('title')) {
        return;
    }
    this.slug = this.makeSlug();
});

QuestionsSchema.methods.makeSlug = function(){
    return slugify(
        this.title, {
            replacement: '-',
            remove: /[*+~.()'"!:@]/g,
            lower: true
        }
    );
};

module.exports = mongoose.model('Question', QuestionsSchema);
