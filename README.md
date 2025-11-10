# Bloom GYM Website

## Overview
Bloom GYM is a responsive, front-end fitness website that allows users to explore gym programs, view galleries, contact gym managers, and manage personal profiles.  
The project focuses on interactive design, form validation, theme switching, and smooth navigation using HTML, CSS, Bootstrap, and JavaScript with jQuery.

---

## Features

### 1. User Interface
- Responsive layout built with **Bootstrap 5**.
- Smooth navigation bar with dropdown and toggler for mobile view.
- Scroll progress bar indicating page reading progress.
- Light/Dark theme toggle with state persistence.
- Footer with project and team credits.

### 2. Authentication
- Modal-based **Sign Up / Sign In** system.
- Data is stored using **localStorage** (no backend required).
- Validation for name, email, phone, and password.
- Profile page dynamically loads stored user data.
- Log out function resets local data.

### 3. Contact Management
- Dedicated **Contacts Page** with dynamically generated manager cards.
- Integrated contact buttons for email and phone.
- “Get Started” button linking to a feedback form.

### 4. Form Functionality
- Message form with input validation and feedback alerts.
- Automatic field reset upon successful submission.
- User-friendly error messages.

### 5. Dynamic Elements
- Real-time date and time display.
- Scroll animations and transitions.
- Input validation for phone, email, and password fields.
- Interactive buttons with hover and active effects.

### 6. Theme and Accessibility
- Light/Dark mode switcher implemented using JavaScript.
- Readable color palette and accessible font contrast.
- Optimized for desktop and mobile browsers.

---

## Description of Main Pages

### `index.html`
- Homepage introducing Bloom GYM.
- Contains navigation bar, theme toggle, hero section, and footer.
- Uses scroll progress bar for visual navigation feedback.

### `profile.html`
- Contains Sign Up and Sign In forms.
- Uses JavaScript for validation and saving data to `localStorage`.
- Displays user data (name, surname, email, phone) after login.
- Includes a Log Out button to clear user session.

### `contacts.html`
- Displays dynamically generated manager cards with contact information.
- Includes navigation and footer consistent with other pages.
- “Get Started” button links to `form.html`.

### `programs.html`
- Lists gym programs or workout categories.
- Uses consistent design with interactive hover animations.

### `gallery.html`
- Displays image gallery with responsive grid.
- Supports hover animations and image enlarging (depending on JS logic).

### `form.html`
- Message submission form.
- Validates name, email, phone, and message fields.
- Displays alerts on successful or failed submission.

---
## External API Integration
The project integrates the **Spoonacular API** to fetch and display **healthy recipes and nutrition information**.  
Users can search for meals, view calorie and macronutrient data, and receive ingredient suggestions dynamically.  
All requests are handled through `fetch()` using asynchronous JavaScript and rendered in real time on the page.

---
## JavaScript Functionality (`script.js`)

| Functionality | Description |
|----------------|-------------|
| **Theme Toggle** | Switches between light and dark modes, saving user preference. |
| **Progress Bar** | Updates dynamically as the user scrolls. |
| **Form Validation** | Validates email, phone, name, and password fields. |
| **Authentication** | Handles Sign Up / Sign In logic using `localStorage`. |
| **Dynamic Contacts** | Generates manager cards dynamically. |
| **Modal Control** | Switches between Sign In and Sign Up interfaces. |
| **API Integration** | Connects to Spoonacular API to display nutrition and recipe data. |

---
## CSS Structure (style.css)

| Section | Description |
|----------|-------------|
| **General Styles** | Base fonts, colors, layout settings. |
| **Navbar and Footer** | Background color `#f4c2c2` and text color consistency. |
| **Scroll Progress Bar** | Fixed top bar indicating scroll progress. |
| **Buttons and Forms** | Rounded buttons with hover effects and smooth transitions. |
| **Theme Styles** | Defines color variables for dark and light modes. |
| **Grid Layouts** | Flexbox and grid for gallery and contacts sections. |

---

