/**
 * Scraper Service - Orchestrator for all web scrapers
 * Manages scraping jobs, data normalization, and database updates
 */

import cron from 'node-cron';
import Resource from '../models/Resource.js';
import { scrapeNAMIArticles } from '../scrappers/namiScraper.js';
import { scrapeMindfulResources } from '../scrappers/mindfulScraper.js';

// Scraper configurations
const SCRAPER_CONFIG = {
    nami: {
        enabled: true,
        schedule: '0 4 * * *', // 4 AM daily
    },
    mindful: {
        enabled: true,
        schedule: '30 4 * * *', // 4:30 AM daily
    }
};

/**
 * Initialize Scraper Service
 */
export function initializeScraperService() {
    console.log('🕷️ Initializing Scraper Service...');

    // Schedule NAMI Scraper
    if (SCRAPER_CONFIG.nami.enabled) {
        cron.schedule(SCRAPER_CONFIG.nami.schedule, async () => {
            console.log('🔄 Running NAMI Scraper...');
            await runNAMIScraper();
        });
    }

    // Schedule Mindful Scraper
    if (SCRAPER_CONFIG.mindful.enabled) {
        cron.schedule(SCRAPER_CONFIG.mindful.schedule, async () => {
            console.log('🔄 Running Mindful.org Scraper...');
            await runMindfulScraper();
        });
    }

    console.log('✅ Scraper Service scheduled');
}

/**
 * Run NAMI Articles Scraper
 */
export async function runNAMIScraper() {
    try {
        const articles = await scrapeNAMIArticles();
        if (!articles || articles.length === 0) {
            console.log('⚠️ No articles found from NAMI');
            return;
        }

        let newCount = 0;
        for (const article of articles) {
            const resourceData = {
                title: article.title,
                description: article.summary,
                type: 'article',
                url: article.url,
                imageUrl: article.imageUrl || 'https://www.nami.org/NAMI/media/NAMI-Media/NAMI-Logo-Blue.png',
                source: { name: 'NAMI', scrapedAt: new Date() },
                publishedAt: article.publishedAt || new Date(),
                tags: ['mental health', 'news'],
                category: 'general'
            };

            const result = await Resource.updateOne({ url: resourceData.url }, { $set: resourceData }, { upsert: true });
            if (result.upsertedCount > 0) newCount++;
        }
        console.log(`✅ NAMI Scraper: ${newCount} new articles`);
    } catch (error) {
        console.error('❌ NAMI Scraper failed:', error.message);
    }
}

/**
 * Run Mindful.org Scraper
 */
export async function runMindfulScraper() {
    try {
        const resources = await scrapeMindfulResources();
        if (!resources || resources.length === 0) {
            console.log('⚠️ No resources found from Mindful.org');
            return;
        }

        let newCount = 0;
        for (const res of resources) {
            const resourceData = {
                title: res.title,
                description: res.summary,
                type: res.type,
                url: res.url,
                imageUrl: res.imageUrl,
                source: { name: 'Mindful.org', scrapedAt: new Date() },
                tags: ['mindfulness', 'meditation'],
                category: 'mindfulness'
            };

            const result = await Resource.updateOne({ url: resourceData.url }, { $set: resourceData }, { upsert: true });
            if (result.upsertedCount > 0) newCount++;
        }
        console.log(`✅ Mindful Scraper: ${newCount} new resources`);
    } catch (error) {
        console.error('❌ Mindful Scraper failed:', error.message);
    }
}

/**
 * Run all scrapers manually
 */
export async function runAllScrapers() {
    console.log('🚀 Manually running all scrapers...');
    await Promise.allSettled([
        runNAMIScraper(),
        runMindfulScraper()
    ]);
    return { status: 'success', message: 'Scrapers completed' };
}

export default {
    initializeScraperService,
    runAllScrapers,
};
