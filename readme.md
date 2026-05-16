# TaskFlow — Task Manager App

A single-page task management app built with pure HTML, CSS, and vanilla JavaScript.
No frameworks, no libraries, no build tools. Just one file you open in a browser.

---

## What It Does

- User login and registration (stored in localStorage, per browser)
- Create, edit, and delete tasks
- Set priority (High / Medium / Low), status, category, and due date
- Kanban board view — three columns: To Do / In Progress / Done
- List view — flat list with checkboxes to toggle tasks done
- Stats bar — total tasks, in progress, done, overdue counts + progress bar
- Search bar to filter tasks by title or description
- Filter buttons — All / Active / Completed
- Toast notifications for every action
- Keyboard shortcut: press N to open the new task modal, Escape to close it

---

## Screens

1. Auth Screen — login / register with tab toggle, form validation, error messages
2. App Screen — sticky header with user chip and logout button, then main content below

---

## Fonts Used (Google Fonts)

- Syne — headings, buttons, labels
- DM Mono — inputs, code-style text, metadata
- Instrument Serif — italic tagline on the auth screen

Import link (already in the file):
https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&family=Instrument+Serif:ital@0;1&display=swap

---

## Color Palette (CSS Variables)

--bg:         #0a0a0f    (page background, near black)
--surface:    #111118    (cards, panels)
--surface2:   #18181f    (inputs, secondary surfaces)
--surface3:   #22222c    (hover states, tags)
--accent:     #c8f542    (lime green — primary buttons, highlights)
--text:       #f0eee8    (main text)
--text-muted: #7a7a8a    (secondary text)
--red:        #ff5e5e    (high priority, delete, overdue)
--orange:     #ffac5e    (medium priority)
--blue:       #5eb8ff    (low priority)
--purple:     #b57bff    (in-progress badge)

---

## Key CSS Techniques

- CSS custom properties for the entire theme
- CSS Grid for stats row (4 columns), kanban board (3 columns), form rows (2 columns)
- position: fixed with backdrop-filter: blur for the sticky header
- Keyframe animations: fadeUp (auth card entrance), slideIn (task cards appearing)
- ::before pseudo-element on task cards for the colored left priority border
- -webkit-line-clamp to truncate long task descriptions to 2 lines
- transition on every interactive element using a shared --transition variable
- Modal uses opacity + pointer-events + scale transform for open/close animation

---

## JavaScript — How It Works

1. Auth
   - Users stored in localStorage as a JSON array
   - Login checks email + password match
   - Register checks for duplicate email
   - Current logged-in user saved to localStorage

2. Tasks
   - Each task is an object: { id, title, desc, status, priority, category, due, owner, created }
   - Tasks saved to localStorage under a key tied to the user's email
   - Every action (create, edit, delete, toggle) calls saveTasks() then renderAll()

3. Views
   - viewMode variable switches between 'board' and 'list'
   - renderAll() calls either renderBoard() or renderList() based on viewMode
   - updateStats() recalculates the 4 stat numbers and progress bar percentage

4. Filtering
   - getFiltered() applies the active status filter and search query
   - Both views always render from getFiltered(), not the raw task array

5. Modal
   - openModal(id) — if id passed, pre-fills form for editing; if null, blank form for new task
   - saveTask() — updates existing or unshifts new task to the front of the array
   - Clicking the overlay background closes the modal

6. Toast
   - showToast(message, icon) creates a div, appends it, then removes it after 2.8 seconds

7. Keyboard shortcuts
   - N key opens new task modal
   - Escape closes the modal

---

## How to Build Your Own

1. Create index.html
2. Add the Google Fonts import in <head>
3. Define all colors in :root as CSS variables
4. Build two screens: #auth-screen and #app-screen
5. Toggle between them using JavaScript (display: none / block / flex)
6. Store users and tasks in localStorage with JSON.stringify / JSON.parse
7. Write render functions that wipe and re-draw the task list on every change
8. Add a modal overlay with a form for creating and editing tasks
9. Open in browser — done

---

## File Structure

taskflow/
└── index.html   (everything — HTML, CSS, JS in one file)

---

## To Customize

- Colors: edit the :root block at the top of the <style> tag
- Add new task fields: add an input to the modal form, include the field in the task object in saveTask()
- Add a new filter: add a button to the toolbar and update getFiltered() to handle it
- Add more categories: update the <select> options in the modal form
- Change fonts: swap the Google Fonts URL and update font-family references

