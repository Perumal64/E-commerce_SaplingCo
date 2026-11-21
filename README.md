# Sapling & Co. — plant nursery e-commerce (HTML/CSS/JS + jQuery Ajax + Firebase)

## Setup
1. Firebase console → new project → enable **Authentication → Email/Password** and **Firestore** (production mode).
2. Paste `apiKey` + `projectId` into `js/config.js`; set `adminEmail` (same email in `firestore.rules`), then publish `firestore.rules`.
3. Serve with a local server (VS Code Live Server). Open `login.html` → **Sign up** with the admin email → you land in Admin → click **Load sample nursery data**.
4. Optional bill emails: create an EmailJS service/template (variables `to_email`, `subject`, `{{{message}}}`) and fill `emailjs` in config. Password reset emails are sent by Firebase itself.

## Git (Azure Repos)
`git init && git add . && git commit -m "feat: ..."` then `git remote add origin <azure-url> && git push -u origin main` — commit after each feature.

## Spec map
Item = Id, Cat_id, title, des, qty, price · Pagination + read all/by category/individual · Update all but id · Activate/Deactivate · Delete with Yes/No confirm · Customer credit limit (default 0) CRUD · 14 reports (customer, inventory, sales) with date ranges, CSV, print · Sign up/in/reset, validations · Cart with quantities · Cash / credit-limit payment · Bill + email · Order history.
