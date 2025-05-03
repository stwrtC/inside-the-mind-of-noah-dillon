const fs = require('fs');
const RSS = require('rss');

const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
const historyPath = './history.json';
let history = [];

if (fs.existsSync(historyPath)) {
  try {
    const content = fs.readFileSync(historyPath, 'utf8').trim();
    history = content ? JSON.parse(content) : [];
  } catch (err) {
    console.error('❌ Failed to parse history.json. Is it valid JSON?');
    console.error(err.message);
    process.exit(1);
  }
} else {
  // If the file doesn't exist, create it with empty array
  fs.writeFileSync(historyPath, JSON.stringify([], null, 2));
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
console.log(`Posted: ${item.title}`);

// Update history
history.push(item.id);
fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
