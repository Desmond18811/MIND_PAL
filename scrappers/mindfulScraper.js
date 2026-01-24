/**
 * Mindful.org Scraper
 * Scrapes mindfulness articles and guided audio sessions
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.mindful.org';

/**
 * Scrape Mindful.org for recent audio and articles
 */
export const scrapeMindfulResources = async () => {
    try {
        // Scrape the "Audio" or "Meditation" category page
        // Note: Real URLs change, this is a best-effort structure based on common WP sites
        const { data } = await axios.get(`${BASE_URL}/category/meditation`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; MindPalBot/1.0)'
            }
        });
        const $ = cheerio.load(data);

        const resources = [];

        // Select article/card elements (generic selector strategy)
        $('article').each((i, element) => {
            const titleLink = $(element).find('h2 a, h3 a').first();
            const title = titleLink.text().trim();
            const url = titleLink.attr('href');
            const summary = $(element).find('.excerpt, p').first().text().trim();
            const img = $(element).find('img').attr('src');

            // Detect if likely audio/meditation
            // (Often indicated by "Guided Meditation" in title or category tags)
            const isAudio = title.toLowerCase().includes('guided') ||
                title.toLowerCase().includes('meditation') ||
                $(element).text().toLowerCase().includes('audio');

            if (title && url) {
                resources.push({
                    title,
                    url,
                    summary,
                    type: isAudio ? 'audio' : 'article',
                    imageUrl: img,
                    source: 'Mindful.org',
                    category: 'mindfulness'
                });
            }
        });

        return resources.slice(0, 10);
    } catch (error) {
        console.error('Mindful.org scraping error:', error.message);
        return [];
    }
};

export default { scrapeMindfulResources };
