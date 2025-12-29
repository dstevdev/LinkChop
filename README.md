# LinkChop

A high-performance URL shortener built to demonstrate full-stack engineering principles, including Base62 encoding and custom analytics tracking.

## Features

- **Instant Shortening:** Converts long URLs into unique 6-character slugs.
- **Redirection:** Handles high-speed 301/302 redirects.
- **Analytics:** Tracks clicks and referrers for every link.
- **Custom Slugs:** (Optional) Users can define their own short-links.

## Stack

- **Frontend:** React, Mantine
- **Backend:** Node.js & Express
- **Database:** PostgreSQL (Supabase)
- **Logic:** Base62 Hashing Algorithm

## The Logic: Why Base62?

Instead of using random strings, LinkChop uses a Base62 encoding system. This allows for over **56 billion** unique URLs using only 6 characters `(0-9, a-z, A-Z)`.
