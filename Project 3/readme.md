# NEXMART — E-Commerce Web App

A single-page e-commerce app built with pure HTML, CSS, and vanilla JavaScript.
No frameworks, no build tools. One file, open in browser, fully working.

---

## What It Does

### Customer Side
- Browse products on a hero landing page with featured items
- Filter products by category (Electronics, Fashion, Books, etc.)
- Search products by name
- Click any product to open a detail modal with description, rating, and stock
- Add to cart, adjust quantity, remove items
- Slide-out cart sidebar with live total
- Checkout flow — 3 steps: address → payment → confirmation
- View order history with order tracking timeline
- Write product reviews and ratings
- Edit profile (name, phone, password)

### Admin Side
- Separate admin dashboard (login as admin to access)
- Stats overview — total revenue, orders, products, users
- Products tab — add, edit, delete products with a modal form
- Orders tab — view all orders, manage status (pending → processing → shipped → delivered → cancelled)
- Users tab — view all registered users and their order counts
- Analytics tab — orders by status, revenue by category, low stock alerts

---

## Pages / Screens

1. Home — hero section + featured products + category filter chips
2. Shop — full product grid with search and filters
3. Orders — logged-in user's order list with tracking
4. Profile — edit personal details, change password
5. Admin — dashboard with 4 tabs (Products, Orders, Users, Analytics)
6. Auth Modal — login and register in a tabbed modal overlay

---

## Demo Accounts

Admin:  admin@nexmart.com  /  admin123
User:   user@nexmart.com   /  user123

---

## Fonts Used (Google Fonts)

- Syne — headings, product names, prices, stat values
- DM Sans — body text, buttons, forms, nav

Import link (already in the file):
https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap

---

## Color Palette (CSS Variables)

--bg:       #0a0a0f    (page background)
--surface:  #13131a    (panels, cart sidebar)
--surface2: #1c1c27    (inputs, hover states)
--card:     #16161f    (product cards)
--border:   #2a2a3a    (all borders)
--accent:   #6c63ff    (purple — primary buttons, links, active states)
--accent2:  #ff6584    (pink — badges, cart count, secondary highlights)
--accent3:  #43e97b    (green — success, delivered status, stock OK)
--text:     #f0f0ff    (main text)
--muted:    #8888aa    (secondary text, labels)
--warn:     #ffb347    (orange — low stock, pending status)
--danger:   #ff6584    (red — out of stock, delete, cancelled)

---

## Key CSS Techniques

- CSS custom properties for the entire theme
- CSS Grid for product grid (auto-fill, minmax 260px), stats grid, form rows
- position: fixed with backdrop-filter: blur for nav and cart overlay
- Cart sidebar uses translateX(100%) → translateX(0) transition for slide-in animation
- Modals use display: none → display: flex + scale/translateY animation on open
- Status badges use semi-transparent background with matching text color (rgba trick)
- ::before pseudo-element on stat cards for the colored top border stripe
- Noise texture overlay on body using an inline SVG data URI + feTurbulence filter
- filter-chip pill buttons with border-radius: 999px
- Order timeline built with absolutely positioned ::before lines between dots

---

## JavaScript — How It Works

1. Database
   - All data (users, products, orders) lives in a DB object
   - Saved and loaded from localStorage using JSON.stringify / JSON.parse
   - Every write calls saveDB() to persist changes

2. Auth
   - doLogin() finds a matching user by email + password in DB.users
   - doRegister() checks for duplicate email, pushes a new user object
   - currentUser variable holds the logged-in user throughout the session
   - Admin check: if currentUser.role === 'admin', the admin nav link appears

3. Cart
   - cart is an array of { productId, name, price, qty, icon }
   - Saved separately in localStorage under 'nexmart_cart'
   - addToCart() checks if item exists and increments qty, or pushes new item
   - renderCart() wipes and redraws the sidebar on every change

4. Products
   - renderProducts(list) loops over products and builds product card HTML
   - Filtering: products array filtered by selectedCategory and search query
   - Product detail modal: openProductDetail(id) finds product by id and renders a full modal

5. Checkout
   - 3-step flow controlled by checkoutStep variable (1, 2, 3)
   - checkoutData object stores address and payment info between steps
   - placeOrder() creates a new order object and pushes it to DB.orders

6. Admin
   - adminTab(section) switches between products / orders / users / analytics
   - Each tab wipes the admin content area and renders fresh HTML
   - saveProduct() either updates existing product (by editingProductId) or pushes a new one
   - updateOrderStatus() finds the order by id and updates its status field

7. Order Tracking
   - Timeline steps: Order Placed → Processing → Shipped → Out for Delivery → Delivered
   - Each step is marked done / current / pending based on the order's current status

8. Reviews
   - submitReview() pushes a rating number into the product's ratings array
   - avgRating(product) calculates average with array reduce

9. Toast Notifications
   - toast(message, type) creates a div, appends to #toast-container
   - Fades out and removes itself after 3 seconds

---

## How to Build Your Own

1. Create index.html
2. Add the Google Fonts import in <head>
3. Define all colors in :root as CSS variables
4. Create pages as divs with class "page" and toggle class "active" to show/hide
5. Build a fixed <nav> that calls a navigate(page) function on each link click
6. Store all data in a DB object, save/load with localStorage
7. Write render functions for products, cart, orders that rebuild HTML on every change
8. Build modals as fixed overlays, toggle an "open" class to show/hide them
9. Add a toast function for all user feedback
10. Open in browser — done

---

## File Structure

nexmart/
└── index.html   (everything — HTML, CSS, JS in one file)

---

## To Customize

- Colors: edit the :root block at the top of the <style> tag
- Add a product category: add an <option> to the category select in the product modal form
- Add an order status: update the statusBadge() function and the timeline steps array
- Change currency: search for ₹ in the file and replace with your symbol
- Add a new page: create a <div class="page" id="your-page">, add a nav link, handle it in navigate()
- Change products: edit the products array in the DB object at the top of the <script> tag
