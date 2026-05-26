require('dotenv').config();

const Fastify = require('fastify');
const cors = require('@fastify/cors');
const Database = require('better-sqlite3');
const OpenAI = require('openai');

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: '*'
});

// SQLite Database
const db = new Database('movies.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_input TEXT,
    recommended_movies TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// API Route
fastify.post('/recommend', async (request, reply) => {
  try {
    const { preference } = request.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a movie recommendation assistant.'
        },
        {
          role: 'user',
          content: `Recommend 5 movies for: ${preference}. Return only movie names separated by commas.`
        }
      ]
    });

    const responseText = completion.choices[0].message.content;

    const movies = responseText.split(',').map(movie => movie.trim());

    // Save to database
    db.prepare(
  `INSERT INTO recommendations (user_input, recommended_movies)
   VALUES (?, ?)`
).run(preference, JSON.stringify(movies));
    reply.send({ movies });

  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Something went wrong' });
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({
  port: process.env.PORT || 5000,
  host: '0.0.0.0'
});
    console.log('Server running on port 5000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();