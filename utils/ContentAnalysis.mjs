
import natural from 'natural';

const analyzer = new natural.SentimentAnalyzer("English", natural.PorterStemmer, "afinn");
const stemmer = natural.PorterStemmer;
const tokenizer = new natural.WordTokenizer();

export async function analyzeContent(content) {
    try {
        const tokens = tokenizer.tokenize(content);
        const stems = tokens.map(token => stemmer.stem(token));
        const sentimentScore = analyzer.getSentiment(stems);

        // Enhanced keyword extraction with stopword filtering
        const stopwords = natural.stopwords;
        const keywords = [...new Set(stems)]
            .filter(term => term.length > 3 && !stopwords.includes(term.toLowerCase()))
            .slice(0, 5);

        return {
            sentimentScore: parseFloat(sentimentScore.toFixed(2)),
            keywords
        };
    } catch (error) {
        console.error('Content analysis failed:', error);
        return { sentimentScore: 0, keywords: [] };
    }
}