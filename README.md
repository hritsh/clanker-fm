<p align="center">
  <img src="./public/logo_light.svg" width="64" height="64" alt="clanker icon" />
</p>

<h1 align="center">clanker-fm</h1>

<p align="center">
  <img src="public/screenshots/home.gif" alt="demo" width="600"/>
  <br/>
</p>

---

## what is this?

**clanker-fm** is an ai-powered bot that judges your spotify taste.
you log in, clanker digs through your listening history, asks you a few pointed questions, and then delivers a roast you didn’t ask for but probably deserve.  
it also connects you with other users who share your questionable taste.

---

## ✨ features at a glance

| Category          | Highlights                                                                             |
| ----------------- | -------------------------------------------------------------------------------------- |
| 🤖 **AI Roast**   | Interactive Q&A + instant AI reactions → final teardown, roast score, shareable card   |
| 📊 **Metrics**    | Variety score, basicness index, genre diversity, and listening pattern analytics       |
| 👥 **Neighbours** | Similarity search (weighted Jaccard) → ranked matches, “mutual bad taste” callouts     |
| 🏠 **Dashboard**  | Terminal-style homepage with top artists/tracks/genres → fast, cached, responsive UI   |
| 🧩 **Extras**     | Export system (html2canvas), edge-cached APIs (<100ms), retry states, fully responsive |

---

## 🛠 tech stack

| Category   | Technology              |
| ---------- | ----------------------- |
| Framework  | next.js 14 + app router |
| Auth       | nextauth.js (spotify)   |
| Styling    | tailwind css            |
| Animations | framer-motion           |
| AI         | openai api / gemini api |
| State      | react context + hooks   |
| Export     | html2canvas             |
| Database   | vercel postgresql       |
| Deployment | vercel                  |

---

## all features

### 🤖 ai roast — now with interrogation

clanker doesn’t just spit out a verdict — he makes you squirm first.

- **scanning recents**: clanker looks through and roasts your recent played music, while processing the rest of the data in the background.

<table align="center">
  <tr>
    <td align="center">
      <img src="public/screenshots/scanning_3.gif" alt="Scanning your Spotify data" width="600"/>
    </td>
  </tr>
  <tr>
    <td align="center">
      step 1: scanning your spotify recently played
    </td>
  </tr>
</table>

- **interactive q&a**: 6 multiple-choice questions based on your own data (“which of these tracks screams ‘me, but a more annoying version’?”)

- **live responses**: clanker reacts instantly to your picks with dry, surgical commentary

<table align="center">
  <tr>
    <td align="center">
      <img src="public/screenshots/qna.gif" alt="Interactive Q&A" width="600"/>
    </td>
  </tr>
  <tr>
    <td align="center">
      step 2: interactive Q&A with snarky responses
    </td>
  </tr>
</table>

- **final analysis**: variety score, basicness index, most replayed track, “tracks of concern,” and emotional support artists

<table align="center">
  <tr>
    <td align="center">
      <img src="public/screenshots/final1.gif" alt="Final AI Roast" width="600"/>
    </td>
  </tr>
  <tr>
    <td align="center">
      step 3: the final roast verdict and scores
    </td>
  </tr>
</table>

- **verdict**: a paragraph-long teardown of your taste, equal parts psychoanalysis and insult comedy
- **rating**: a brutally honest score out of 10 (margin of error: 0)
- **exportable**: save the roast card to share your shame

<table align="center">
  <tr>
    <td align="center">
      <img src="public/screenshots/roast_card.png" alt="Exportable custom roast card" width="400"/>
    </td>
  </tr>
  <tr>
    <td align="center">
      exportable custom roast card
    </td>
  </tr>
</table>

---

### 📊 listening metrics

because numbers hurt more than words.

- **variety score** — how adventurous you are (or aren’t)
- **basicness index** — a polite way of saying “you listen to the same stuff as everyone else”
- **genre diversity** — counts how many genres you actually touch
- **listening patterns** — time-based habits, peaks, and troughs

---

### 👥 neighbours — find people as delusional as you

clanker will happily point out who else is stuck in your sonic bubble.

- **similarity search**: weighted jaccard algorithm compares your top artists, tracks, and genres to other users
- **ranked list**: most compatible “victims” shown with similarity %, common artists/tracks/genres
- **mutual bad taste**: if you share questionable habits, clanker will call it out (“you both have terrible taste in experimental hip hop and alternative hip hop”)
- **shared delusions**: lists the genres you both cling to
- **db-backed**: powered by vercel postgresql so the database is updated in real-time every time someone signs up

<table align="center">
  <tr>
    <td align="center">
      <img src="public/screenshots/neighbors.png" alt="Neighbours" width="500"/>
    </td>
  </tr>
  <tr>
    <td align="center">
      find your musical neighbours (and mutual bad taste)
    </td>
  </tr>
</table>

---

### 🏠 homepage

the calm before the roast.

- terminal-style dashboard with your top artists, tracks, and genres
- responsive and cached for instant reloads
- persistent nav tabs so you can jump between sections without losing your place
- clean, minimal, and just a little smug

<table align="center">
  <tr>
    <td align="center">
      <img src="public/screenshots/statsdashboard.png" alt="Stats Dashboard" width="600"/>
    </td>
  </tr>
  <tr>
    <td align="center">
      listening metrics dashboard
    </td>
  </tr>
</table>

---

### 🧩 extra stuff

things clanker does because it can.

- export system via html2canvas (stats + roast + album art)
- edge-cached api routes for <100ms responses
- graceful loading + retry states (clanker doesn’t panic)
- mobile-friendly + fully responsive because most people will probably run this on their phones
- light/dark mode support for inclusivity

<table align="center">
  <tr>
    <td align="center"><img src="public/screenshots/mobiledark.png" width="180"/></td>
    <td align="center"><img src="public/screenshots/mobilelight.png" width="180"/></td>
    <td align="center"><img src="public/screenshots/roast_card.png" width="320"/></td>
  </tr>
  <tr>
    <td align="center"><em>mobile dark</em></td>
    <td align="center"><em>mobile light</em></td>
    <td align="center"><em>exportable roast card</em></td>
  </tr>
</table>

<table align="center">
  <tr>
    <td align="center"><img src="public/screenshots/home_light.png" width="250"/></td>
    <td align="center"><img src="public/screenshots/home_dark.png" width="250"/></td>
  </tr>
  <tr>
    <td align="center"><em>light mode</em></td>
    <td align="center"><em>dark mode</em></td>
  </tr>
</table>

---

## 🧠 why i built this

spotify wrapped is fine, but it’s once a year and has become way too boring and bland. i wanted something that:

- was unserious and crude
- tore your music taste apart
- made me question my life choices
- worked whenever I felt like it
- could share and connect people with similar tastes
- doubled as a playground for ai, similarity search, and rapid ui iteration
- also, clanker needed a new hobby.

---

## 💡 inspiration

a few years back i remember coming across [pudding.cool](https://pudding.cool), which did a viral spotify “roast” —  
funny, but it was static and rule-based (no real ai).

**clanker.fm** cranks it up:

- actual **ai roasts** (openai / gemini)
- **interactive q&a** tied to your own data
- live commentary + neighbours with “mutual bad taste”

pudding walked so clanker could roast at scale.

---

## 🧩 architecture

### data flow

1. spotify oauth via nextauth.js
2. ai roast generation (openai api and gemini api options) with interactive q&a
3. fetch top tracks, artists, genres, patterns
4. homepage sections populate with stats
5. neighbours query vercel postgresql db + compute similarity (weighted jaccard algorithm)
6. export custom roast card via html2canvas

---

## 🚀 performance & ux

- local caching for roast, stats, neighbour matches
- responsive design from mobile to desktop
- edge-cached api routes for speed
- minimal loading states, no unnecessary spinners

---

## 🏗 development

```bash
git clone https://github.com/hritsh/clanker-fm.git
cd clanker-fm && npm install

cp .env.example .env.local
# add spotify creds, ai keys, db url

npm run dev
```

### required apis:

- spotify developer app
- openai or gemini api key
- nextauth secret
- vercel postgresql db

---

## 📜 license

MIT

---

<table align="center">
  <tr>
    <td align="center">
      built by <a href="https://hritish.com">hritish</a> | source on <a href="https://github.com/hritsh/clanker-fm">github</a><br>
      <em>"your playlist probably sucks" — clanker</em>
    </td>
  </tr>
  <tr>
    <td align="center">
      +---+<br />
      |o_o|<br />
      |_-_|
    </td>
  </tr>
</table>
