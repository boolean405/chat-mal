# Chat Mal

Real-time chat and calling that’s fast, secure, and cross-platform.

[![Android Download](https://img.shields.io/badge/Android-Download-brightgreen)](https://apkpure.com/p/com.chat.mal)
[![Web App](https://img.shields.io/badge/Web-Open-blue)](https://chatmal.vercel.app)
![iOS](https://img.shields.io/badge/iOS-Coming%20Soon-lightgrey)

---

## Table of Contents

- [Overview](#overview)
- [Live Links](#live-links)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Getting Started (Development)](#getting-started-development)
  - [Prerequisites](#prerequisites)
  - [Backend (server)](#backend-server)
  - [Web (Next.js)](#web-nextjs)
  - [Mobile (Expo React Native)](#mobile-expo-react-native)
- [Environment Variables](#environment-variables)
- [Production & Deployment](#production--deployment)
- [Privacy & Security](#privacy--security)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Contact & Support](#contact--support)

---

## Overview

**Chat Mal** is a modern messaging app with real-time chat, voice/video calls, stories, and media sharing—designed for reliability, privacy, and smooth performance across devices.

- **Android:** available via APK (APKPure).
- **Web:** fully responsive web client.
- **iOS:** coming soon.

---

## Live Links

- **Android (APK):** https://apkpure.com/p/com.chat.mal
- **Web:** https://chatmal.vercel.app
- **iOS:** Coming soon

---

## Features

- Real-time messaging with delivery/read receipts
- Voice & video calling (camera/mic controls, front/back switch)
- Stories & media sharing (images, videos), secure storage
- End-to-end encryption for calls (WebRTC SRTP); message data encrypted in transit (TLS)
- Push notifications for new messages and calls
- Account & profile (avatar, status, privacy controls)
- Multi-platform: Android app + Web app (iOS in progress)

> NOTE: If your build includes message E2EE, update this section to reflect it precisely.

---

## Tech Stack

- **Mobile:** Expo React Native (TypeScript)
- **Web:** Next.js (App Router) + TypeScript
- **Backend:** Node.js (Express, JavaScript) + MongoDB (Mongoose) + Redis
- **Realtime:** Socket.IO
- **Media/RTC:** WebRTC
- **Validation:** Joi
- **Auth:** JWT (and/or OAuth2)
- **Infra:** EAS (mobile builds), Vercel (web), any Node-friendly host for API

---
