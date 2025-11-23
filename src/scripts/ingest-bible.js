const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Must use Service Role Key for writing
const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiApiKey) {
    console.error('Missing environment variables. Please check .env.local');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_GENERATIVE_AI_API_KEY');
    process.exit(1);
}
 
const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function generateEmbedding(text) {
    try {
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return null;
    }
}

async function ingestBible() {
    const filePath = path.join(process.cwd(), 'public', 'kjv.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    console.log('Bible data loaded. Starting ingestion...');

    const books = data.books;
    let totalVerses = 0;
    let processedVerses = 0;

    // Calculate total verses for progress tracking (optional, rough estimate)
    // for (const bookKey in books) totalVerses += Object.keys(books[bookKey].chapters).length * 20; 

    for (const bookKey in books) {
        const book = books[bookKey];
        console.log(`Processing Book: ${bookKey}`);

        for (const chapterKey in book.chapters) {
            const chapter = book.chapters[chapterKey];
            // Skip intro chapters if they don't have verses or content we want
            if (chapterKey.endsWith('.intro')) continue;

            const verses = chapter.verses;
            for (const verseKey in verses) {
                const verseText = verses[verseKey];

                // Construct a meaningful content string for embedding
                // e.g., "Genesis 1:1 - In the beginning God created..."
                const reference = verseKey.replace(/\./g, ' '); // GEN.1.1 -> GEN 1 1
                const contentToEmbed = `${reference}: ${verseText}`;

                const embedding = await generateEmbedding(contentToEmbed);

                if (embedding) {
                    const { error } = await supabase.from('documents').insert({
                        content: verseText,
                        metadata: {
                            book: bookKey,
                            chapter: chapterKey,
                            verse: verseKey,
                            reference: reference
                        },
                        embedding: embedding
                    });

                    if (error) {
                        console.error(`Error inserting ${verseKey}:`, error);
                    } else {
                        // console.log(`Inserted ${verseKey}`);
                    }
                }

                processedVerses++;
                if (processedVerses % 100 === 0) {
                    console.log(`Processed ${processedVerses} verses...`);
                }

                // Rate limiting to avoid hitting Gemini API limits too hard
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
    }

    console.log('Ingestion complete!');
}

ingestBible();
