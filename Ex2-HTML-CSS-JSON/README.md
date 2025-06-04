[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/KmF3mufN)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19698382&assignment_repo_type=AssignmentRepo)
# app.js Functionality

A brief overview of what `app.js` does in this project.
![alt text](images/image.png)
## Features

- **Fetch & Render**
  - Loads `data/items.json`
  - Displays each item as a card with image, title, author, and description
  - Shows an error message in the designated container if the fetch fails
  ![alt text](images/image-1.png)

- **Live Search**
  - Filters displayed cards in real time
  - Matches against title or author as you type
  ![alt text](images/image-2.png)

- **Sorting**
  - Sorts the current (and possibly filtered) list by:
    - Title A → Z / Z → A
    - Author A → Z / Z → A
    ![alt text](images/image-3.png)

- **Dark / Light Theme Toggle**
  - Switches between dark mode and light mode (class name for icon: "bi bi-sun-fill" / "bi bi-moon-fill")
  - Saves the chosen theme in `localStorage` so it persists after reload (learn about localStorage)
  ![alt text](images/image-4.png)

- **Error Handling**
  - Displays “No items found.” when no cards match the current search/sort
  - Hides broken images so their alt text becomes visible
  ![alt text](images/image-5.png)

## Usage Flow

1. **Page Load**
   - Fetch JSON data
   - Render all cards
   - Apply stored theme from `localStorage` (Dark or Light)

2. **Search Input**
   - Instantly filters cards as the user types

3. **Sort Dropdown**
   - Reorders the (possibly filtered) cards upon change

4. **Theme Button**
   - Toggles between dark/light mode and updates `localStorage`

5. **Empty Results**
   - If no cards match, shows “No items found.”