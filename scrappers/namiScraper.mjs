import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.nami.org';

export const scrapeNAMIArticles = async () => {
    try {
        const { data } = await axios.get(`${BASE_URL}/About-NAMI/NAMI-News`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MindPalBot/1.0; +https://yourdomain.com/bot)'
            }
        });
        const $ = cheerio.load(data);

        const articles = [];

        $('.news-item').each((i, element) => {
            const title = $(element).find('h3 a').text().trim();
            const relativeUrl = $(element).find('h3 a').attr('href');
            const url = relativeUrl.startsWith('http') ? relativeUrl : `${BASE_URL}${relativeUrl}`;
            const summary = $(element).find('.news-excerpt').text().trim();
            const dateText = $(element).find('.news-date').text().trim();

            if (title && url) {
                articles.push({
                    title,
                    url,
                    summary,
                    publishedAt: parseNAMIDate(dateText),
                    source: 'nami'
                });
            }
        });

        return articles.slice(0, 15); // Limit to 15 articles
    } catch (error) {
        console.error('NAMI scraping error:', error.message);
        return [];
    }
};

export const getNAMIArticleContent = async (url) => {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MindPalBot/1.0; +https://yourdomain.com/bot)'
            }
        });
        const $ = cheerio.load(data);

        let content = '';
        $('.article-body p').each((i, element) => {
            content += $(element).text().trim() + '\n\n';
        });

        return content.trim();
    } catch (error) {
        console.error('Error fetching NAMI article content:', error.message);
        return null;
    }
};

function parseNAMIDate(dateText) {
    // Example: "September 12, 2023"
    const months = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11
    };

    const [month, day, year] = dateText.replace(',', '').split(' ');
    return new Date(year, months[month], day);
}