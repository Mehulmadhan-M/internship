# Folio — Blog Platform

A single-page blogging platform built with React (JSX).
No backend, no database. All data lives in memory while the app is open.
Uses the Anthropic Claude API for two AI-powered features.

---

## What It Does

- Register a new account or sign in
- Browse all posts on the home feed, sorted by newest first
- Search posts by title, body, or tag on the Explore page
- Click any post to read the full article
- Create new posts with a title, body, and comma-separated tags
- Edit or delete your own posts
- Comment on any post
- Delete your own comments (post authors can delete any comment on their post)
- View your profile — shows your post count, comment count, and all your essays
- AI Draft — enter a title and Claude writes a 3-paragraph opening for you
- AI Summary — click Summarise on any post and Claude gives a 2-sentence TL;DR

---

## Pages / Components

1. Home — feed of all posts sorted by newest, with a hero intro block
2. Explore — search bar that filters posts live as you type
3. PostDetail — full post view with edit/delete (if author), AI summary panel, and comment section
4. NewPost — write form with title, tags, body textarea, and AI Draft button
5. AuthForm — login and register, shared component toggled by a mode prop
6. Profile — avatar, bio, post/comment stats, and list of your essays
7. Navbar — sticky top nav with active page underline, Write button, avatar, logout

---

## Demo Accounts

ada@example.com     /  password
charlie@example.com /  password

---

## Tech Stack

- React (functional components, hooks)
- No CSS framework — all styles written as inline style objects or a GlobalStyles component
- Anthropic Claude API (claude-sonnet) for AI Draft and AI Summary features
- No build tool required if used inside Claude.ai artifacts — runs directly

---

## Fonts Used (Google Fonts)

- Playfair Display — headings, post titles, hero text
- DM Sans — body text, nav, buttons, forms
- DM Mono — tags, labels, AI summary label

Import link (injected via GlobalStyles component):
https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap

---

## Color Palette (CSS Variables)

--ink:    #1a1610    (main text, dark backgrounds)
--paper:  #f5f0e8    (page background, warm off-white)
--cream:  #ede8dc    (tag backgrounds, AI panel background)
--rust:   #c0392b    (active nav, links, error text, delete buttons)
--gold:   #b8860b    (AI summary panel border and label)
--muted:  #7a6f60    (secondary text, metadata)
--line:   #d4cec4    (borders, dividers)
--white:  #faf8f4    (input backgrounds)

---

## Component Breakdown

GlobalStyles
- Injects Google Fonts import and all global CSS via a <style> tag
- Defines CSS variables, keyframe animations (fadeUp, spin, slideIn), scrollbar styles

DB (in-memory object)
- { users, posts, comments, nextUserId, nextPostId, nextCommentId }
- All reads and writes go directly to this object
- Data resets on page refresh (no localStorage)

Toast
- Receives message and type (info / success / error)
- Renders a fixed bottom-right notification
- Auto-removes itself after 3 seconds using useEffect + setTimeout

Avatar
- Takes a user object and a size prop
- Renders a colored circle with the user's initials
- Color picked by user id mod 5

Navbar
- Sticky top bar with logo, Home/Explore links, Write button, avatar, logout
- Active page shown with a rust underline on the nav link
- Shows Sign in / Register buttons when logged out

AuthForm
- Shared for both login and register, controlled by a mode prop
- Login: finds user by email + password match in DB.users
- Register: checks for duplicate email, pushes new user to DB.users
- onSwitch prop lets user toggle between modes

PostCard
- Reusable card used in Home, Explore, and Profile
- Shows tags, title, excerpt, author avatar, date, comment count
- Fades on hover using inline onMouseEnter/onMouseLeave

Home
- Sorts DB.posts by createdAt descending
- Renders a hero heading block then maps posts to PostCard

Explore
- Local state for search query
- Filters posts by title, body, or tag on every keystroke

PostDetail
- Local state for: post data, comments, comment input, edit mode, edit form data, AI summary
- isAuthor check shows Edit/Delete buttons only to the post's author
- canDelete on comments allows comment owner or post author to delete
- saveEdit updates the post in DB.posts and exits edit mode
- summarise calls askClaude with the post title + body, shows result in a gold-bordered panel

NewPost
- Local state for form (title, body, tags) and aiLoading
- publish splits tags by comma, builds a post object, pushes to DB.posts
- aiAssist calls askClaude with the title, sets the returned text as the body

Profile
- Filters DB.posts and DB.comments by currentUser.id
- Shows post/comment counts and lists all user's posts via PostCard

App (root)
- Holds page, currentUser, activePostId, and toasts in useState
- navigate(page) sets the page and scrolls to top
- Renders one page at a time using conditional JSX
- Renders all active toasts from the toasts array at the bottom

---

## AI Features

askClaude(prompt, systemPrompt)
- Calls https://api.anthropic.com/v1/messages
- Model: claude-sonnet-4-20250514
- Returns the text content from the response

AI Draft (in NewPost)
- Prompt: "Write a compelling 3-paragraph blog post introduction for the title: [title]"
- Result fills the body textarea

AI Summary (in PostDetail)
- Prompt: "Summarise this blog post in 2 sentences: [title + body]"
- Result appears in a gold-bordered callout box below the post body

---

## How to Build Your Own

1. Create App.jsx with a root App component
2. Define a DB object at the top with users, posts, and comments arrays
3. Use useState in App to track: current page, current user, active post id, toasts
4. Write a navigate(page) function that sets the page and scrolls to top
5. Render one component at a time based on the page state using conditional JSX
6. Build each page as its own component that receives data and callbacks as props
7. Write all styles as inline style objects or inject a global <style> tag
8. Add the AI feature by calling the Anthropic API in an async function
9. Build a Toast component with useEffect + setTimeout for auto-dismiss

---

## File Structure

folio/
└── App.jsx   (all components, data, styles, and logic in one file)

---

## To Customize

- Colors: edit the :root block inside the GlobalStyles component
- Fonts: swap the Google Fonts URL and update fontFamily values
- Add a new page: add a new component, handle a new page string in App's conditional render, add a nav link
- Add a field to posts: add the input to NewPost form, include it in the post object in publish(), and render it in PostDetail
- Persist data: replace the DB object reads/writes with localStorage.getItem / setItem calls
- Change AI behavior: edit the prompt string inside aiAssist (NewPost) or summarise (PostDetail)
