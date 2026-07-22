# Roadmap

## Now
- [x] "You're Absolutely Right!" in big block letters
- [x] "You're Absolutely Slopped™" leaderboard with mock data (`data/mock-slop.js` mimics the shape the real scraper should produce — swap that file for live data)

## Future: The Slop Leaderboard
An automatically updating leaderboard of the most egregiously AI-slopped LinkedIn posts by cringey "thought leaders".

Rough shape:
- Scrape/collect LinkedIn posts (LinkedIn scraping ToS is hostile — may need a third-party data source, manual submissions, or a browser extension for crowdsourced reports)
- Score posts for slop signals (em-dash abuse, "It's not X. It's Y.", "Let that sink in.", rocket emojis, "I'm humbled to announce", bullet-point parables that end in a business lesson)
- Rank and display on a leaderboard
- Keep it up to date automatically (scheduled job)
