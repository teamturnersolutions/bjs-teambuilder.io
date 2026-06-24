# 🔴 BJ's Team Feud Game & Asset Manager

Welcome to **BJ's Team Feud**, a customized, premium web-based party game designed for BJ's Wholesale Club events. This application allows teams to face off in a classic family-feud style questionnaire, customizable via a local asset manager.

---

## 🎨 BJ's Branding & Color Palette

This application uses the official BJ's color scheme to deliver an immersive and consistent experience:
* **Primary Red** (`#C8102E`): Applied on action buttons, badges, headers, and strike indicators.
* **Secondary Gold** (`#FFB81C`): Used for subheadings, rankings, highlighted point scores, and interactive links.
* **Slate Dark Theme**: High-contrast, premium dark background to provide a modern, sleek presentation environment.

---

## 🚀 Game Features

1. **Fully Interactive Board**: Displays ranks, answers, points, three strike indicators (`XXX`), and current point bank.
2. **Setup Builder Screen**: Built-in visual questionnaire constructor that supports:
   - **Manual entry** of questions, answers, and points.
   - **Bulk import** (paste structured copy-paste tables directly).
3. **Team Management**: Real-time team score banking and click-to-edit team names.
4. **Asset Manager Dashboard (`helper.html`)**: Allows administrators to brand the game on the fly using local database overrides (**IndexedDB**):
   - **Logo**: Custom SVG/PNG header logo.
   - **Winner GIF**: Custom celebrate-screen graphics.
   - **Background Music**: Custom looping MP3 track.

---

## 📂 File Architecture

* 🎮 `teamFeud.html` — The main game engine, board, setup manager, and audio synthesizers.
* ⚙ `helper.html` — The Asset Manager dashboard to upload and configure assets.
* 🖼 `bjs-logo.png` — Default brand logo for BJ's Wholesale Club.
* 🎬 `winnerScreen.gif` — Default celebration animation shown when a team wins.
* 🎵 `Family Feud 2010.mp3` — Default background/winner screen theme track.

---

## 🛠 Running the Game

### Option A: Using Docker (Recommended for quick porting)
1. Build the Docker image:
   ```bash
   docker build -t team-feud .
   ```
2. Start the container on port 8080:
   ```bash
   docker run -d -p 8080:80 --name bjs-teamfeud team-feud
   ```
3. Open `http://localhost:8080/` in your web browser.

### Option B: Using Local Python Server
1. Start the HTTP server in the game directory:
   ```bash
   python3 -m http.server 8080
   ```
2. Open `http://localhost:8080/` in your web browser.

---

## ⚙ Customizing Game Assets

You can modify the logo, winner celebration GIF, or background music at any time without changing a single line of code:
1. Click the **⚙ Assets** button in the header or setup page (which redirects to `helper.html`).
2. **Option A (Web URLs)**: Paste direct URLs or relative file paths into the input fields and click **Apply URL**.
3. **Option B (Direct Upload)**: Drag and drop or click to upload your custom logo (`.png`/`.svg`), celebration animation (`.gif`/`.webp`), or music loop (`.mp3`). These are loaded directly into the browser's persistent IndexedDB storage.
4. Click **Launch Team Feud Game** to return to the active board with your overrides applied.
5. Click **Reset to Default** to restore the standard BJ's configurations at any time.

---

## 📜 Audio Details
* Synthesized sound effects (reveals, strikes, point awards) are rendered in real-time using the Web Audio API.
* Theme music (`Family Feud 2010.mp3` or custom override) loops continuously when the winner screen is active, and automatically pauses and resets when the **Play Again** button is clicked.

