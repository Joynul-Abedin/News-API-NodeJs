// const express = require('express');
// const axios = require('axios');
// const cheerio = require('cheerio');

// const app = express();


// // Function to fetch news from a given URL and category
// const fetchNews = async (categoryPath, category) => {
//     const baseUrl = 'https://edition.cnn.com';
//     let articles = [];
//     let id = 0;

//     try {
//         const fullUrl = baseUrl + categoryPath;
//         const response = await axios.get(fullUrl);
//         const $ = cheerio.load(response.data);
//         $('div.card').each((i, element) => {
//             const aTag = $(element).find('a');
//             const headlineTag = $(element).find('span[data-editable="headline"]');
//             const imageTag = $(element).find('img');

//             if (aTag && headlineTag && imageTag) {
//                 let link = aTag.attr('href');
//                 // Ensure the link is absolute
//                 if (link.startsWith('/')) {
//                     link = baseUrl + link;
//                 }

//                 const title = headlineTag.text();
//                 const imageLink = imageTag.attr('src');
//                 const source = "CNN";
//                 news_id = id+1,
//                 articles.push({
//                     id: news_id,
//                     title: title ?? '',
//                     link: link ?? '',
//                     image: imageLink ?? '',
//                     source: source?? '',
//                     category: category
//                 });
//                 id = news_id
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching news:', error);
//     }

//     return articles;
// };

// // Endpoint for fetching all news
// app.get('/', async (req, res) => {
//     const categories = [
//         { path: '/', category: 'All' },
//         { path: '/world', category: 'World' },
//         { path: '/entertainment', category: 'Entertainment' },
//         { path: '/health', category: 'Health' },
//         { path: '/business/tech', category: 'Technology' },
//         { path: '/sport', category: 'Sports' },
//         { path: '/politics', category: 'Politics' },
//         { path: '/business', category: 'Business' }
//         // Add more categories if needed
//     ];

//     let allArticles = [];
//     for (const category of categories) {
//         const articles = await fetchNews(category.path, category.category);
//         allArticles = allArticles.concat(articles);
//     }

//     res.json(allArticles);
// });


// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });


const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const connectDB = require('./DataBase/DB'); // Import the database connection
const NewsArticle = require('./Models/NewArticles'); // Import the model
const app = express();

// Connect to MongoDB
connectDB();

// fetchNews function
const fetchNews = async (categoryPath, category) => {
    const baseUrl = 'https://edition.cnn.com';
    let articles = [];
    let id = 0;

    try {
        const fullUrl = baseUrl + categoryPath;
        const response = await axios.get(fullUrl);
        const $ = cheerio.load(response.data);

        $('div.card').each((i, element) => {
            const aTag = $(element).find('a');
            const headlineTag = $(element).find('span[data-editable="headline"]');
            const imageTag = $(element).find('img');

            if (aTag && headlineTag && imageTag) {
                let link = aTag.attr('href');
                // Ensure the link is absolute
                if (link.startsWith('/')) {
                    link = baseUrl + link;
                }

                const title = headlineTag.text();
                const imageLink = imageTag.attr('src');
                const source = "CNN";
                id++;

                articles.push({
                    id: id,
                    title: title ?? "",
                    link: link ?? "",
                    image: imageLink ?? "",
                    source: source ?? "",
                    category: category
                });
            }
        });
    } catch (error) {
        console.error('Error fetching news:', error);
    }

    return articles;
};

// Define categories
const categories = [
    { path: '/', category: 'All' },
    { path: '/world', category: 'World' },
    { path: '/entertainment', category: 'Entertainment' },
    { path: '/health', category: 'Health' },
    { path: '/business/tech', category: 'Technology' },
    { path: '/sport', category: 'Sports' },
    { path: '/politics', category: 'Politics' },
    { path: '/business', category: 'Business' }
    // Add more categories if needed
];

// Endpoint for fetching all news
app.get('/', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let existingNews = await NewsArticle.find({ dateFetched: { $gte: today } });

        if (existingNews.length > 0) {
            res.json(existingNews);
        } else {
            let allArticles = [];
            
            for (const category of categories) {
                const articles = await fetchNews(category.path, category.category);
                allArticles = allArticles.concat(articles);
            }

            // Save new articles to MongoDB
            await NewsArticle.insertMany(allArticles.map(article => ({
                ...article,
                dateFetched: new Date() // Add the dateFetched field
            })));

            res.json(allArticles);
        }
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).send('Server error');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
