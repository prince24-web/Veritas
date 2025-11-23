import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { analyzeUserMessage } from '@/lib/classifier';
import { curatedVerses } from '@/lib/curated-verses';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Google Generative AI
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 60;

export async function POST(req) {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    console.log("--- New Request ---");
    console.log("User Query:", userQuery);

    // 1. Parallel Execution: Analyze User & Generate Embedding
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

    const [analysis, embeddingResult] = await Promise.all([
        analyzeUserMessage(userQuery),
        embeddingModel.embedContent(userQuery)
    ]);

    const embedding = embeddingResult.embedding.values;
    console.log("Analysis:", JSON.stringify(analysis, null, 2));

    // Check if the query is factual/neutral
    const isFactual =
        analysis.intent === 'fact-finding' ||
        analysis.intent === 'theological_question' ||
        analysis.emotion === 'neutral' ||
        analysis.emotion === 'curious';

    // 2. Fetch Curated Verses (Only if NOT factual/neutral)
    let curatedDocs = [];
    if (!isFactual) {
        const targetEmotions = [analysis.emotion, analysis.topic].filter(Boolean);
        let targetIds = [];

        for (const key of targetEmotions) {
            const lowerKey = key.toLowerCase();
            if (curatedVerses[lowerKey]) {
                targetIds = [...targetIds, ...curatedVerses[lowerKey]];
            }
        }

        targetIds = [...new Set(targetIds)].slice(0, 5);

        if (targetIds.length > 0) {
            console.log("Fetching Curated Verses:", targetIds);
            const orQuery = targetIds.map(id => `metadata->>verse.eq.${id}`).join(',');
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .or(orQuery);

            if (!error && data) {
                curatedDocs = data.map(doc => ({ ...doc, source: 'curated' }));
            }
        }
    } else {
        console.log("Skipping Curated Verses (Factual/Neutral Query)");
    }

    // 3. Fetch RAG Verses (Vector Search)
    let ragDocs = [];
    const { data: vectorData, error: vectorError } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5,
    });

    if (!vectorError && vectorData) {
        ragDocs = vectorData.map(doc => ({ ...doc, source: 'rag' }));
    } else {
        console.error("Error querying RAG:", vectorError);
    }

    // 4. Combine & Deduplicate Context
    const allDocs = [...curatedDocs, ...ragDocs];
    const uniqueDocs = [];
    const seenVerses = new Set();

    for (const doc of allDocs) {
        const verseId = doc.metadata.verse;
        if (!seenVerses.has(verseId)) {
            seenVerses.add(verseId);
            uniqueDocs.push(doc);
        }
    }

    console.log(`Total Context Docs: ${uniqueDocs.length}`);

    // 5. Construct Context String
    const contextText = uniqueDocs.map(doc => {
        return `[${doc.metadata.reference}] (Source: ${doc.source.toUpperCase()})\n${doc.content}`;
    }).join('\n\n');

    // 6. Create Dynamic System Prompt
    let systemPrompt;

    if (isFactual) {
        // Teacher Persona
        systemPrompt = `You are a knowledgeable and clear Bible teacher.
        
        USER QUERY: "${userQuery}"
        INTENT: ${analysis.intent}
        
        CONTEXT (Bible Verses):
        ${contextText}
        
        INSTRUCTIONS:
        1. **Direct Answer**: Answer the user's question clearly and concisely based on the Bible.
        2. **Use Context**: Cite the provided verses to support your answer.
        3. **Tone**: Informative, objective, and helpful. No need for excessive emotional validation.
        4. **Format**: Use Markdown. Bold verse references.
        
        If the context doesn't contain the answer, use your general biblical knowledge.`;
    } else {
        // Empathetic Persona
        systemPrompt = `You are a wise, empathetic, and Spirit-filled Bible companion.
        
        USER ANALYSIS:
        - Emotion: ${analysis.emotion}
        - Intent: ${analysis.intent}
        
        CONTEXT (Bible Verses):
        ${contextText}
        
        INSTRUCTIONS:
        1. **Empathy First**: Start by acknowledging the user's feeling ("${analysis.emotion}") in a warm, comforting way.
        2. **Biblical Wisdom**: Use the provided verses to answer.
        3. **Application**: Explain *how* these verses apply to their situation.
        4. **Tone**: Gentle, encouraging, non-judgmental, and hopeful.
        5. **Format**: Use Markdown. Bold verse references.`;
    }

    // 7. Stream Response
    const result = await streamText({
        model: google('gemini-2.5-flash'),
        system: systemPrompt,
        messages,
    });

    return result.toTextStreamResponse();
}
