# Food Finders

One plain HTML page listing today's free-food events at Stony Brook, rebuilt daily from the public SBEngaged calendar feed (events tagged "Free Food & Refreshments").

## Run locally

Requires Node 22 or newer. No dependencies.

```sh
node build.mjs
```

This downloads the feed, keeps events running today in New York time, and writes `index.html`. If the download fails or the feed has no events, it exits with an error and leaves `index.html` untouched.

For testing, `FEED_URL` overrides the feed address:

```sh
FEED_URL=https://example.com/ node build.mjs   # fails, index.html unchanged
```

## Daily updates

`.github/workflows/update.yml` runs `node build.mjs` every day at 11:17 UTC (6:17 AM EST / 7:17 AM EDT) and commits `index.html` if it changed. It can also be run by hand from the Actions tab ("Update index.html" → "Run workflow").

## Publish with GitHub Pages

Repository Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save.
