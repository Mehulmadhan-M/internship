# Personal Portfolio Website

A single-page portfolio website built with pure HTML, CSS, and vanilla JavaScript. No frameworks, no build tools — just one file you can open in a browser.

---

## What's Inside

The page is divided into these sections, top to bottom:

1. Navbar — fixed top nav with smooth scroll links and a hire/contact CTA button
2. Hero — full-screen intro with your name, title, and a scroll indicator
3. Marquee — auto-scrolling ticker showing your tech stack
4. About — two-column layout with bio on the left, a fake code window visual on the right
5. Skills — dark background grid of skill category cards (Frontend, Backend, etc.)
6. Projects — 2-column card grid; the first card spans full width as a featured/internship highlight
7. Journey — sticky heading on the left, vertical timeline of experience/education on the right
8. Contact — two-column layout with your contact links on the left, a contact form on the right
9. Footer — one-liner copyright + social links

---

## Fonts Used (Google Fonts)

- Fraunces — serif, used for big headings
- Syne — sans-serif, used for nav, labels, numbers
- DM Mono — monospace, used for body text and code snippets

Import link to paste in your <head>:
https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&display=swap

---

## Color Palette (CSS Variables)

--ink:     #0d0d0d    (text, dark backgrounds)
--paper:   #f5f0e8    (page background, warm off-white)
--accent:  #c8451a    (rust red — links, highlights, underlines)
--accent2: #1a6bc8    (blue — cursor hover state)
--muted:   #7a7267    (secondary text, descriptions)
--border:  rgba(13,13,13,0.12)
--card-bg: #ffffff

---

## Key CSS Techniques

- CSS custom properties (variables) for the entire theme
- CSS Grid for About (1fr 1fr), Skills (3 columns), Projects (2 columns), Journey, Contact
- position: fixed for the navbar and custom cursor
- Keyframe animations: fadeUp (section entrance), marquee (infinite scroll), scrollLine (hero indicator), floatTag (floating labels), blink (cursor in code window)
- mix-blend-mode: multiply on the cursor dot for a blending effect
- clamp() for fluid responsive font sizes
- ::after pseudo-element underline animation on nav links (width: 0 to 100%)
- scroll-behavior: smooth on html

---

## JavaScript Features

1. Custom cursor
   - Two elements: a small filled dot (#cursor) and a larger ring (#cursorRing)
   - Dot follows mouse exactly; ring lerps toward mouse using requestAnimationFrame
   - Hovering any link/button/card adds a .hovered class that resizes both elements

2. Scroll reveal
   - All elements with class .reveal are hidden by default (opacity: 0, translateY)
   - IntersectionObserver watches them and adds .visible when they enter the viewport
   - Staggered delays handled by extra classes: .reveal-d1, .reveal-d2

3. Active nav link on scroll
   - Loops through all sections on scroll, finds the current one by offsetTop
   - Updates matching nav link color to --ink

4. Nav shadow on scroll
   - Adds a box-shadow to the nav when window.scrollY > 20

5. Contact form
   - Prevents default submit, changes button text to "Sent ✓", resets after 3 seconds

6. Smooth scroll for anchor links
   - Overrides default jump behavior with scrollIntoView({ behavior: 'smooth' })

---

## How to Build Your Own

1. Create one HTML file (index.html)
2. Add the Google Fonts import link in <head>
3. Define your CSS variables in :root
4. Build each section as a <section id="..."> block
5. Add the fixed <nav> before your sections
6. Copy the JS at the bottom inside a <script> tag
7. Replace all content (name, bio, projects, links) with your own
8. Open in browser — done

---

## File Structure

portfolio/
└── index.html   (everything — HTML, CSS, JS in one file)

---

## To Customize

- Colors: edit the :root variables at the top of your <style> block
- Fonts: swap the Google Fonts URL and update font-family values
- Projects: duplicate a .project-card div and update the text inside
- Skills: duplicate a .skill-card div, change the icon, name, and tags
- Timeline: duplicate an .exp-item div in the Journey section
- Contact links: update the href and text inside .contact-link anchors
