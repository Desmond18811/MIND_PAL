import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.cdc.gov';

export const scrapeCDCArticles = async () => {
    try {
        const { data } = await axios.get(`${BASE_URL}/mentalhealth/data_stats.htm`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MindPalBot/1.0; +https://yourdomain.com/bot)'
            }
        });
        const $ = cheerio.load(data);

        const articles = [];

        // Scrape featured articles
        $('.card').each((i, element) => {
            const title = $(element).find('.card-title a').text().trim();
            const relativeUrl = $(element).find('.card-title a').attr('href');
            const url = relativeUrl.startsWith('http') ? relativeUrl : `${BASE_URL}${relativeUrl}`;
            const summary = $(element).find('.card-text').text().trim();

            if (title && url) {
                articles.push({
                    title,
                    url,
                    summary,
                    source: 'cdc'
                });
            }
        });

        return articles.slice(0, 15); // Limit to 15 articles
    } catch (error) {
        console.error('CDC scraping error:', error.message);
        return [];
    }
};

export const getCDCArticleContent = async (url) => {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MindPalBot/1.0; +https://yourdomain.com/bot)'
            }
        });
        const $ = cheerio.load(data);

        let content = '';
        $('#main-content p').each((i, element) => {
            content += $(element).text().trim() + '\n\n';
        });

        return content.trim();
    } catch (error) {
        console.error('Error fetching CDC article content:', error.message);
        return null;
    }
};