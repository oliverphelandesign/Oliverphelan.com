# studio site

Two pages: a landing page (`index.html`) and a horizontal-scroll portfolio (`portfolio.html`).

## Put it on GitHub

1. Create a new repo on GitHub (e.g. `studio-name`).
2. Upload everything in this folder to it — either drag the files into the GitHub web UI, or:
   ```
   git init
   git add .
   git commit -m "site"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**, set Source to `main` branch, root folder. GitHub gives you a live URL a minute later.

## Before you launch

- `index.html`: swap `STUDIO NAME` for your actual name/label, and swap `YOUR_HANDLE` in the Instagram link for your real handle.
- `portfolio.html`: swap the `<title>` if you want.

## Adding work to the portfolio

There's no upload button — GitHub Pages can't run a server, so "uploading" means adding files to the repo. It's still simple:

1. Drop your files into `assets/portfolio/` (images, gifs, mp4 videos, or PDFs).
2. Open `assets/portfolio/manifest.json` and add one entry per piece, in the order you want them to appear:

```json
[
  { "type": "image", "src": "assets/portfolio/look-01.jpg", "caption": "Trousers Project — cobra buckle waist" },
  { "type": "gif",   "src": "assets/portfolio/detail.gif" },
  { "type": "video", "src": "assets/portfolio/runway.mp4" },
  { "type": "pdf",   "src": "assets/portfolio/lookbook.pdf", "caption": "Lookbook" }
]
```

Notes:
- `"caption"` is optional — leave it out or set it to `""` if you don't want a label.
- A PDF gets split automatically: each page becomes its own slide in the scroll, labelled "page 1/6" etc.
- gifs just use `"type": "gif"` and render the same as images.
- Commit and push after editing the manifest, and the live site updates.

## Scrolling

The portfolio page scrolls horizontally only. Trackpad, mouse wheel, touch swipes, and arrow keys are all wired to move the rail sideways — a vertical swipe or scroll still pages horizontally, it doesn't scroll the page down.

## Notes

- Fonts (Big Shoulders Display, IBM Plex Mono/Sans) and pdf.js load from CDNs, so you need an internet connection for those — no local install needed.
- Everything is plain HTML/CSS/JS. No build step, no npm.
