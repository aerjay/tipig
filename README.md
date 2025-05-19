# Project Tipig
In Hiligaynon, *tipig* means: 

> preserving, keeping (in a safe state); to guard well, reserve, preserve, keep, and save.

## Background
I have aphantasia (I can only see black when I close my eyes) and a hard time remembering things, so preserving my memories is super important to me. Capturing those imperfect, emotional moments helps me relive them later, no matter how happy or messy they are.

## Goal

To preserve these imperfect memories through a camera lens, capturing the feelings and emotions of those precious moments. These photos serve as reminders and help me feel something meaningful. At the same time, this project allows me to explore and learn new front-end technologies. It is my way of keeping, preserving, and *tipig*an my memories while expanding my technical knowledge.

When accessing this web app, I want to evoke the same feelings you get when walking through a museum or gallery, marveling at beautiful works of art — whether paintings, sculptures, or other creations. In this case, the works are my photos — my memories.

## Technical Implementation

### Features
- Clean, museum-like layout with generous spacing
- Responsive design for all devices
- Smooth animations and transitions
- Lazy loading for optimal performance
- Caption overlay on hover
- Subtle parallax effects

### Setup
1. Clone this repository
2. Add your photos to the `images` directory
3. Update the gallery section in `index.html` with your images and captions
4. Open `index.html` in a web browser to view the site

### Adding New Photos
To add a new photo to the gallery:

1. Place your image in the `images` directory
2. Add a new gallery item in `index.html` following this structure:

```html
<div class="gallery-item">
    <img src="images/your-image.jpg" alt="Description" class="gallery-image">
    <div class="caption">
        <p class="caption-text">Your caption or story here</p>
    </div>
</div>
```

### Customization
- Colors and typography can be modified in `styles.css`
- Animation effects can be adjusted in both `styles.css` and `script.js`
- The layout can be modified by adjusting the grid settings in `styles.css`

### Browser Support
The website is compatible with all modern browsers that support:
- CSS Grid
- CSS Flexbox
- Intersection Observer API
- CSS Transitions and Animations

### Credits
- Fonts: Google Fonts (Playfair Display, Cormorant Garamond)
- Design inspired by classical art museums 