const mongoose = require('mongoose');

const NewsArticleSchema = new mongoose.Schema({
    title: String,
    link: String,
    image: String,
    source: String,
    category: String,
    dateFetched: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NewsArticle', NewsArticleSchema);

