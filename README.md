# Ocraft Web

A simple browser-playable Ocraft prototype.

## Controls
- WASD: move
- Space: jump
- Mouse: look
- Left click: mine block
- Right click: place block
- 1–4: choose block type
- Esc: release mouse

## Run locally
Because the project uses JavaScript modules, run it through a small local web server.

### Python
```bash
python -m http.server 8000
```

Then open:
`http://localhost:8000`

## Put it online with GitHub Pages
1. Create a new GitHub repository named `ocraft`.
2. Upload `index.html`, `style.css`, `game.js`, and `README.md`.
3. Open the repository's **Settings**.
4. Open **Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select `main` and `/ (root)`.
7. Save.

GitHub will give you a public URL for the game.
