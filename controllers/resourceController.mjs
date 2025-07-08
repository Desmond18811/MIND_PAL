import Resource from '../models/Resource.mjs';
import axios from 'axios';
import natural from 'natural';
import { updateScore } from './palScoreController.mjs';
import { scrapeNAMIArticles, getNAMIArticleContent } from '../scrappers/namiScraper.mjs';
import { scrapeCDCArticles, getCDCArticleContent } from '../scrappers/cdcScraper.mjs';


const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Fetch and store resources from external APIs
export const fetchResources = async (req, res) => {
    try {
        const { category, limit = 10 } = req.query;

        // Fetch from multiple sources in parallel
        const [newsApiResults, namiResults, cdcResults] = await Promise.all([
            fetchNewsApiResources(category, limit),
            fetchNAMICDCResources('nami'),
            fetchNAMICDCResources('cdc')
        ]);

        // Process and store resources
        const savedResources = await Promise.all([
            ...newsApiResults.map(processAndSaveResource),
            ...namiResults.map(processAndSaveResource),
            ...cdcResults.map(processAndSaveResource)
        ]);

        res.json({
            message: `Successfully fetched and stored ${savedResources.length} resources`,
            resources: savedResources
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

async function fetchNAMICDCResources(source) {
    try {
        const scraper = source === 'nami' ? {
            scraper: scrapeNAMIArticles,
            contentFetcher: getNAMIArticleContent
        } : {
            scraper: scrapeCDCArticles,
            contentFetcher: getCDCArticleContent
        };

        const articles = await scraper.scraper();
        const enhancedArticles = await Promise.all(
            articles.map(async article => ({
                ...article,
                content: await scraper.contentFetcher(article.url),
                source
            }))
        );

        return enhancedArticles;
    } catch (error) {
        console.error(`Error fetching ${source} resources:`, error.message);
        return [];
    }
}

// Get recommended resources based on user profile
export const getRecommendedResources = async (req, res) => {
    try {
        const userId = req.user._id;
        const { categories, preferredTypes, difficulty } = req.body;

        // In a real app, we'd get these from user profile
        const userPreferences = {
            categories: categories || ['stress', 'mindfulness'],
            preferredTypes: preferredTypes || ['article', 'video'],
            difficulty: difficulty || 'intermediate'
        };

        // Get resources matching preferences
        const query = {
            categories: { $in: userPreferences.categories },
            type: { $in: userPreferences.preferredTypes },
            difficulty: userPreferences.difficulty,
            isVerified: true
        };

        const resources = await Resource.find(query)
            .sort({ averageRating: -1, lastFetched: -1 })
            .limit(10)
            .lean();

        // If not enough, fallback to broader query
        if (resources.length < 5) {
            const fallbackResources = await Resource.find({
                isVerified: true
            })
                .sort({ averageRating: -1 })
                .limit(10 - resources.length)
                .lean();

            resources.push(...fallbackResources);
        }

        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Rate a resource
export const rateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { rating, feedback } = req.body;

        const resource = await Resource.findOneAndUpdate(
            { _id: id },
            {
                $push: {
                    userRatings: {
                        userId,
                        rating,
                        feedback
                    }
                }
            },
            { new: true }
        );

        // Update Pal score for engaging with resources
        await updateScore(userId, {
            type: 'resource-engagement',
            _id: id,
            ratingValue: rating
        });

        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Search resources
export const searchResources = async (req, res) => {
    try {
        const { query, category, type } = req.query;

        const searchQuery = {
            $text: { $search: query }
        };

        if (category) searchQuery.categories = category;
        if (type) searchQuery.type = type;

        const resources = await Resource.find(searchQuery, {
            score: { $meta: "textScore" }
        })
            .sort({ score: { $meta: "textScore" } })
            .limit(20)
            .lean();

        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper functions
async function fetchNewsApiResources(category, limit) {
    const apiKey = process.env.NEWS_API_KEY;
    const query = `mental health ${category || ''}`;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=${limit}&apiKey=${apiKey}`;

    try {
        const response = await axios.get(url);
        return response.data.articles.map(article => ({
            title: article.title,
            source: 'newsapi',
            url: article.url,
            content: article.content,
            summary: article.description,
            publishedAt: new Date(article.publishedAt),
            metadata: {
                author: article.author,
                sourceName: article.source.name
            }
        }));
    } catch (error) {
        console.error('NewsAPI error:', error.message);
        return [];
    }
}

async function fetchContextualWebResources(category, limit) {
    const apiKey = process.env.CONTEXTUAL_WEB_API_KEY;
    const query = `mental health ${category || ''}`;
    const url = `https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/NewsSearchAPI?q=${encodeURIComponent(query)}&pageSize=${limit}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'contextualwebsearch-websearch-v1.p.rapidapi.com'
            }
        });
        return response.data.value.map(item => ({
            title: item.title,
            source: 'contextualweb',
            url: item.url,
            content: item.body,
            summary: item.description,
            publishedAt: new Date(item.datePublished),
            metadata: {
                provider: item.provider.name
            }
        }));
    } catch (error) {
        console.error('ContextualWeb API error:', error.message);
        return [];
    }
}

async function processAndSaveResource(resourceData) {
    // Check if already exists
    const existing = await Resource.findOne({ url: resourceData.url });
    if (existing) {
        existing.lastFetched = new Date();
        return existing.save();
    }

    // Analyze content for categories
    const categories = await analyzeContentForCategories(resourceData.content || resourceData.summary);

    // Estimate reading time
    const wordCount = resourceData.content ? resourceData.content.split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    const resource = new Resource({
        ...resourceData,
        categories,
        readingTime,
        isVerified: ['cdc', 'nami', 'jstor'].includes(resourceData.source)
    });

    return resource.save();
}

async function analyzeContentForCategories(text) {
    if (!text) return ['general'];

    const tokens = tokenizer.tokenize(text.toLowerCase());
    const stems = tokens.map(token => stemmer.stem(token));

    // Simple keyword matching (would be enhanced in production)
    const categoryKeywords = {
        anxiety: ['anxiety', 'worry', 'panic', 'fear'],
        depression: ['depress', 'sad', 'hopeless', 'melancholy'],
        stress: ['stress', 'overwhelm', 'pressure', 'burnout'],
        mindfulness: ['mindful', 'meditate', 'present', 'awareness'],
        sleep: ['sleep', 'insomnia', 'dream', 'rest'],
        relationships: ['relation', 'partner', 'friend', 'family'],
        trauma: ['trauma', 'ptsd', 'abuse', 'trigger'],
        productivity: ['productive', 'focus', 'motivate', 'procrastinate']
    };

    const matchedCategories = [];
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => stems.some(stem => stem.includes(keyword)))) {
            matchedCategories.push(category);
        }
    }

    return matchedCategories.length > 0 ? matchedCategories : ['general'];
}