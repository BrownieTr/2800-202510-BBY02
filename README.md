# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## About Us
Team Name: BBY-02
Team Members: 
- Brownie Tran
- Raymond Yang
- Luis Saberon
- Yang Li
- Person 5
## Project Details
Project Name: PlayPal
Project Description: PlayPal is a web app to match people wanting to play sports against new competitors based on preferences like location, timing and ability to enjoy your chosen sport and compete against like-minded people within your community.

Techstack:
- MongoDB (Database)
- Express (Backend)
- React (Frontend)
- Vite (Frontend)
- Cors

## File Structure

|.gitignore
  about.html
  index.html
  package-lock.json
  package.json
  postcss.config.js
  README.md
  tailwind.config.js
  vite.config.js
  .env
|
├───public
│       vite.svg
│
├───server
│       config.env
│       databaseConnection.cjs
│       server.cjs
│
└───src
    │   App.jsx
    │   main.jsx
    │
    ├───assets
    │       react.svg
    │
    ├───components
    │   ├───layout
    │   │       footer.jsx
    │   │       navbar.jsx
    │   │       stickyFooter.jsx
    │   │
    │   └───ui
    │           backButton.jsx
    │           bettingCard.jsx
    │           button.jsx
    │           chatBubble.jsx
    │           chatIcon.jsx
    │           clickableIcons.jsx
    │           DarkModeContext.jsx
    │           eventCard.jsx
    │           link.jsx
    │           loginButton.jsx
    │           logoutPopUp.jsx
    │           menu.jsx
    │           menuItem.jsx
    │           messageCard.jsx
    │           notificationBell.jsx
    │           profileIcon.jsx
    │
    ├───pages
    │       chat.jsx
    │       createEvent.jsx
    │       events.jsx
    │       favSport.jsx
    │       findingMatch.jsx
    │       index.jsx
    │       landing.jsx
    │       MatchPreferences.jsx
    │       messages.jsx
    │       newChat.jsx
    │       profile.jsx
    │       setUpProfile.jsx
    │       sportsBetting.jsx
    │
    ├───sections
    │       features.jsx
    │       options.jsx
    │       profileEditForm.jsx
    │       profile_details.jsx
    │
    ├───services
    │       ai.js
    │       betting.js
    │       config.env
    │       locationService.jsx
    │       matchMaking.js
    │       protectedRoutes.jsx
    │
    └───styles
            App.css
            index.css


## Project Installation
You will need javascript, react and vite, as well as a MongoDB account.
You will need API keys from MongoDB, IPinfo, and Google GenAI


## Features
Connect with each other users in queue
Communicate with other users through chat
Join events through the event page

## Credits, References, Licenses

## AI Acknowledgement
AI is used as per Surprise Challenge #2 to generate a quote based on the sport the user is queueing up for.

## Contact Information

Luis Saberon: lsaberon@my.bcit.ca