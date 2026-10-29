# Lily Garden 🌸

A garden of lilies that bloom on screen, built with plain HTML, CSS and JavaScript (no dependencies, no build step). Works on phones and desktops.

## Usage

Open `index.html` in your browser. To publish it, any static host works (GitHub Pages, Netlify, Vercel).

- The lilies grow and open on their own when the page loads.
- Tap or click the garden to plant a lily right at that spot.
- "Replant the garden" restarts the animation.

## Customization

Edit the `CONFIG` block at the top of `main.js`:

```js
const CONFIG = {
  nome: "My love",
  mensagem: "Every lily here bloomed thinking of you.",
  maxLirios: 90,
};
```

Or share a ready-made link, without touching the code:

```
index.html?nome=Emma&msg=I%20love%20you%20more%20than%20yesterday
```

## Structure

```
index.html   markup and text
style.css    responsive layout and typography
main.js      lily drawing and animation (canvas)
```

## Accessibility

- Respects `prefers-reduced-motion`: the garden appears already in bloom, with no animation.
- The button has a visible keyboard focus style.

## Commit

```bash
git add .
git commit -m "feat: animated lily garden"
```
