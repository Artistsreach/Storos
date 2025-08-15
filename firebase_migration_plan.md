# Firebase Migration Plan

This document outlines the files and configurations that need to be migrated to a new Firebase project.

## Firebase Configuration Files

*   `firebase.json`: Defines the configuration for your Firebase project, including database rules, hosting settings, and Cloud Functions.
*   `.firebaserc`: Stores project aliases, allowing you to easily switch between different Firebase projects.
*   `firestore.rules`: Contains the security rules for your Cloud Firestore database.
*   `storage.rules`: Contains the security rules for Cloud Storage.

## Firebase SDK and Libraries

The following files indicate the use of the Firebase SDK and related libraries. You will need to ensure these are correctly configured in the new project.

*   `package.json`: Mentions `firebase`, `firebase-admin`, and `firebase-functions`.
*   `package-lock.json`: Contains many references to `@firebase/*` packages.
*   `functions/package.json`: Mentions `firebase-admin` and `firebase-functions`.
*   `functions/package-lock.json`: Contains many references to `@firebase/*` packages.

## Cloud Functions

The `functions` directory contains the source code for your Cloud Functions.

*   `functions/index.js`: The main entry point for your Cloud Functions.
*   `functions/.env`: Environment variables for your functions.
*   `functions/.env.fresh25`: Environment variables for your functions.
*   `functions/.env.local`: Environment variables for your functions.

## Hosting

The `hosting` directory contains the files for your Firebase Hosting site.

*   `hosting/index.html`: The main HTML file for your hosting site.
*   `hosting/public/`: This directory contains all the static assets for your website.
*   `hosting/src/`: This directory contains the source code for your website.

## Other Firebase-related files

*   `firestore-debug.log`: Log file for Firestore, may contain useful debugging information.
*   `.idx/integrations.json`: Contains a reference to the Firebase Hosting URL.
*   `src/lib/firebaseClient.js`: This file likely contains the client-side Firebase configuration.

## Authentication

While there are no specific files for Authentication, user data is stored in Firebase Authentication. You will need to export and import user accounts.

## Project Setup

*   You will need to create a new Firebase project in the Firebase console.
*   You will need to set up any required APIs and services in the new project.
*   You will need to configure your new project's settings, such as API keys and auth domains, in your application's configuration.
