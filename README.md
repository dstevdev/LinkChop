# LinkChop

A URL shortener. Paste a long link and get a six-character short one at [linkchop.me](https://linkchop.me), with an optional expiry.

## Features

- **Instant shortening:** converts a long URL into a six-character short code.
- **Expiry:** a link can last 1, 6 or 12 hours, until a custom date and time, or forever.
- **Redirection:** short links are redirected by a Supabase Edge Function.
- **Rate limiting:** enforced in the database, so the limit cannot be skipped from the browser.

## Stack

- **Frontend:** React, Vite, Mantine
- **Backend:** Supabase (a Postgres function that saves links, and an Edge Function that redirects them)
- **Database:** PostgreSQL (Supabase)
- **Hosting:** Vercel, with middleware that forwards short-link paths to the Edge Function

## How the short code is made

The code is not random. LinkChop hashes the URL with SHAKE128 (from `js-sha3`) and keeps 24 bits of output, written as six hexadecimal characters:

```js
const shortCode = shake128(url, 24);
```

Because the code comes from the URL itself, the same link always gets the same code. Six hexadecimal characters allow about 16.7 million different codes.

## How a short link is followed

1. A request for `linkchop.me/<code>` reaches `middleware.js` on Vercel.
2. Any path that is not the homepage or a static file is redirected (307) to the `chop-redirector` Supabase Edge Function.
3. The Edge Function looks the code up and sends the visitor to the original URL.
