const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const connectDB = require('./DataBase/DB'); // Import the database connection
const NewsArticle = require('./Models/NewArticles'); // Import the model
const app = express();

// Connect to MongoDB
connectDB();
let articles = [];
// fetchNews function
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
//                 id++;

//                 articles.push({
//                     id: id,
//                     title: title ?? "",
//                     link: link ?? "",
//                     image: imageLink ?? "",
//                     source: source ?? "",
//                     category: category
//                 });
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching news:', error);
//     }

//     return articles;
// };



// ... [previous imports and setup]

// fetchNews function for CNN (as before)
const fetchNewsFromCNN = async (source, categoryPath, category) => {
    const baseUrl = 'https://edition.cnn.com';
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
        console.error(`Error fetching news from CNN: ${error.message}`);
        console.error(error);
    }

    return articles;
}
// New function for scraping from Times of India
const fetchNewsFromTimesOfIndia = async (source, categoryPath, category) => {
    const baseUrl = 'https://timesofindia.indiatimes.com';
    let articles = [];
    let id = 0;

    try {
        const fullUrl = baseUrl + categoryPath;
        const response = await axios.get(fullUrl);
        const $ = cheerio.load(response.data);

        $('div.col_l_6').each((i, element) => {
            const figureTag = $(element).find('figure');
            const aTag = figureTag.find('a');
            const imgTag = figureTag.find('img');
            const figcaptionTag = figureTag.find('figcaption');

            if (aTag && imgTag && figcaptionTag) {
                const link = aTag.attr('href');
                const title = figcaptionTag.text().trim();
                const imageLink = imgTag.attr('data-src') || imgTag.attr('src');

                id++;

                articles.push({
                    id: id,
                    title: title,
                    link: link ? new URL(link, baseUrl).href : "", // Ensure the link is absolute
                    image: imageLink,
                    source: source,
                    category: category
                });
            }
        });
    } catch (error) {
        console.error('Error fetching news from Times of India:', error);
        console.error(`Error fetching news from CNN: ${error.message}`);
        console.error(error);
    }

    return articles;
};

// New function for scraping from The Daily Star
const fetchNewsFromTheDailyStar = async (source, categoryPath, category) => {
    const baseUrl = 'https://www.thedailystar.net';
    let articles = [];
    let id = 0;

    try {
        const fullUrl = baseUrl + categoryPath;
        const response = await axios.get(fullUrl);
        const $ = cheerio.load(response.data);

        $('.card.position-relative').each((i, element) => {
            const titleTag = $(element).find('h3.title a');
            const linkTag = $(element).find('a').first();
            const imageTag = $(element).find('img');
            const summaryTag = $(element).find('p.intro');

            if (titleTag && linkTag && imageTag && summaryTag) {
                const title = titleTag.text().trim();
                const link = linkTag.attr('href');
                const image = imageTag.attr('data-src') || imageTag.attr('src');
                const summary = summaryTag.text().trim();

                id++;

                articles.push({
                    id: id,
                    title: title,
                    link: link ? new URL(link, baseUrl).href : "",
                    image: image,
                    summary: summary,
                    source: source,
                    category: category
                });
            }
        });
    } catch (error) {
        console.error('Error fetching news from The Daily Star:', error);
    }

    return articles;
};


// New function for scraping from The New York Times International
const fetchNewsFromNYTimes = async (source, categoryPath, category) => {
    const baseUrl = 'https://www.nytimes.com/international';
    let articles = [];
    let id = 0;

    try {
        const fullUrl = baseUrl + categoryPath;
        const response = await axios.get(fullUrl);
        const $ = cheerio.load(response.data);

        $('.css-147kb3k.story-wrapper').each((i, element) => {
            const aTag = $(element).find('a.css-9mylee');
            const titleTag = $(element).find('h3.indicate-hover.css-vf1hbp, h3.indicate-hover.css-1gb49m4');
            const imageTag = $(element).find('img.css-o9w048');
            const summaryTag = $(element).find('p.summary-class.css-dcsqcp');

            if (aTag && titleTag && imageTag) {
                let link = aTag.attr('href');
                let title = titleTag.text().trim();
                let imageLink = imageTag.attr('src');
                let summary = summaryTag.text().trim();

                id++;

                articles.push({
                    id: id,
                    title: title,
                    link: link ? new URL(link, baseUrl).href : "",
                    image: imageLink,
                    summary: summary,
                    source: source,
                    category: category
                });
            }
        });
    } catch (error) {
        console.error('Error fetching news from The Daily Star:', error);
    }

    return articles;
};


// Main fetchNews function
const fetchNews = async (category) => {
    switch (category.website) {
        case 'CNN':
            return await fetchNewsFromCNN(category.website, category.path, category.category);
        case 'TimesOfIndia':
            return await fetchNewsFromTimesOfIndia(category.website, category.path, category.category);
        case 'TheDailyStar':
            return await fetchNewsFromTheDailyStar(category.website, category.path, category.category);
        case 'NYTimes':
            return await fetchNewsFromNYTimes(category.website, category.path, category.category);
        default:
            return [];
    }
};


const categories = [
    { website: 'CNN', path: '/', category: 'All' },
    { website: 'CNN', path: '/world', category: 'World' },
    { website: 'CNN', path: '/entertainment', category: 'Entertainment' },
    { website: 'CNN', path: '/health', category: 'Health' },
    { website: 'CNN', path: '/business/tech', category: 'Technology' },
    { website: 'CNN', path: '/sport', category: 'Sports' },
    { website: 'CNN', path: '/politics', category: 'Politics' },
    { website: 'CNN', path: '/business', category: 'Business' },
    { website: 'TimesOfIndia', path: '/', category: 'All' },    
    { website: 'TimesOfIndia', path: '/world', category: 'World' },
    { website: 'TimesOfIndia', path: '/etimes', category: 'Entertainment' },
    { website: 'TimesOfIndia', path: '/life-style/health-fitness', category: 'Health' },
    { website: 'TimesOfIndia', path: '/business', category: 'Business' },
    { website: 'TimesOfIndia', path: '/sports', category: 'Sports' },
    { website: 'NYTimes', path: '/', category: 'All' },
    { website: 'NYTimes', path: '/section/world', category: 'World' },
    { website: 'NYTimes', path: '/section/health', category: 'Health' },
    { website: 'NYTimes', path: '/section/business', category: 'Business' },
    { website: 'TheDailyStar', path: '/', category: 'All' },
    { website: 'TheDailyStar', path: '/world', category: 'World' },
    { website: 'TheDailyStar', path: '/entertainment', category: 'Entertainment' },
    { website: 'TheDailyStar', path: '/health', category: 'Health' },
    { website: 'TheDailyStar', path: '/business', category: 'Business' },
    { website: 'TheDailyStar', path: '/sports', category: 'Sports' },

];

app.get('/', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let existingNews = await NewsArticle.find({ dateFetched: { $gte: today } });

        if (existingNews.length > 0) {
            console.log('Found existing news, sending response.');
            res.json(existingNews);
        } else {
            let allArticles = [];
            
            for (const category of categories) {
                try {
                    console.log(`Fetching news for category: ${category.category}`);
                    const articles = await fetchNews(category);
                    allArticles = allArticles.concat(articles);
                } catch (error) {
                    console.error(`Error fetching news for category ${category.category}: ${error}`);
                }
            }

            // Check if allArticles array is populated
            console.log(`Number of articles fetched: ${allArticles.length}`);

            // Save new articles to MongoDB
            if (allArticles.length > 0) {
                await NewsArticle.insertMany(allArticles.map(article => ({
                    ...article,
                    dateFetched: new Date() // Add the dateFetched field
                })));
            }

            res.json(allArticles);
        }
    } catch (error) {
        console.error('Error in main endpoint: ', error);
        res.status(500).send('Server error');
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
