# QuickMind (Web)

HTML5 remake of the iOS **QuickMind** game (`TestGameApp`). Runs fully in the browser with ES modules — no build step, no server-side code.

## Run

Serve the project root over HTTP (ES modules require a local server):

```bash
npx --yes serve .
```

Or open with any static file server pointing at this folder, then visit the printed URL.

## Structure

| Path | Role |
|------|------|
| `index.html` | Shell |
| `assets/` | CSS (and future images/audio) |
| `src/` | Models + entry (`main.js`) |
| `scenes/` | Menu + game flows |
| `objects/` | Answer grid, timer, falling background |
| `ui/` | Settings + scoreboard modals |
| `utils/` | Localization, settings, storage, round builder |

## Gameplay (preserved from Swift)

- Difficulties: Easy (8s) / Medium (5s) / Hard (3s)
- Modes: Emoji, Math, Memory, Min/Max, Color
- 15 tappable answers per round on a 3×5 grid
- Score = difficulty points + `timeRemaining × 2`
- Wrong answer or timeout → game over; top 3 scores saved
- TR / EN localization, mode & math-op settings

## Platform notes

- **No AdMob** — stubbed (`utils/MonetizationStub.js`) for YouTube Playables / offline embeds
- **Storage** falls back to memory if `localStorage` is blocked
- Touch-optimized; responsive layout with safe-area insets
