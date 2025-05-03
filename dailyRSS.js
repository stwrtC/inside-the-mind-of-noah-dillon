const fs = require('fs');
const RSS = require('rss');

const dataPath = './data.json';
const historyPath = './history.json';

let data = [];
let history = [];

// Ensure data.json exists and is valid
if (!fs.existsSync(dataPath)) {
    console.error('❌ Missing data.json file.');
    process.exit(1);
}

try {
    const dataContent = fs.readFileSync(dataPath, 'utf8').trim();
    data = dataContent ? JSON.parse(dataContent) : [];
    if (!Array.isArray(data)) {
        throw new Error('data.json must contain an array of posts.');
    }
} catch (err) {
    console.error('❌ data.json is invalid JSON.');
    console.error(err.message);
    process.exit(1);
}

// Ensure history.json exists and is valid
if (!fs.existsSync(historyPath)) {
    console.log('Creating missing history.json...');
    fs.writeFileSync(historyPath, '[]');
}

try {
    const content = fs.readFileSync(historyPath, 'utf8').trim();
    history = content ? JSON.parse(content) : [];
    console.log('📘 Loaded history.json:', history);
} catch (err) {
    console.error('❌ history.json is invalid JSON.');
    console.error(err.message);
    process.exit(1);
}

// Filter unused posts
const unusedPosts = data.filter(post => !history.includes(post.id));

if (unusedPosts.length === 0) {
    console.log('All posts have been used!');
    process.exit(0);
}

// Pick a random unused post
const item = unusedPosts[Math.floor(Math.random() * unusedPosts.length)];

// Create RSS feed
const feed = new RSS({
    title: 'Inside the Mind of Noah Dillon',
    description: '753 tweets spanning from 2014 to 3rd May 2025',
    feed_url: 'https://stwrtc.github.io/inside-the-mind-of-noah-dillon/feed.xml',
    site_url: 'https://stwrtc.github.io/inside-the-mind-of-noah-dillon',
    pubDate: new Date()
});

feed.item({
    title: item.owner_display_name,
    description: item.tweet_text,
    creation: item.created_at,
    replies: item.reply_count,
    retweets: item.retweet_count,
    favourites: item.favourite_count,
    url: item.address,
    date: new Date()
});

fs.writeFileSync('./feed.xml', feed.xml({ indent: true }));
console.log(`Posted: ${item.owner_display_name}`);

// Update history
history.push(item.id);
fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
