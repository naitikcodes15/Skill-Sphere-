# SkillSphere

SkillSphere is a professional real-time 1v1 coding challenge platform designed for competitive programming and skill assessment. The platform enables developers to engage in live coding battles, providing a synchronized environment for multiple programming languages.

> [!IMPORTANT]
> The core features of SkillSphere, including the 1v1 Battle Arena and Solo Practice modes, are now fully functional. The project remains in active development for advanced analytical features.

## Fully Functional Features

- **Real-time 1v1 Battle Arena**: Engage in live coding competitions with synchronized state, opponent tracking, and automatic evaluation.
- **Solo Practice Mode**: Interactive quiz system with real-time question fetching and automated scoring across various categories.
- **Local Execution Engine**: High-performance local code runner supporting C, C++, Java, Python, and JavaScript, eliminating dependency on external Piston APIs.
- **Multi-Language Support**: Complete support for popular languages with pre-configured starter code and test case validation.
- **Live Synchronization**: Real-time code updates and opponent activity status (typing, running) powered by Socket.io.
- **Integrated Monaco Editor**: Professional-grade code editing experience with syntax highlighting and multi-language support.
- **Comprehensive DSA Database**: Pre-seeded with 50+ high-quality Data Structures and Algorithms questions across Easy, Medium, and Hard difficulties.
- **Secure Authentication**: Robust user management using Firebase Authentication with integrated state listeners.
- **Profile & Social**: Dynamic user profiles and friend search functionality with real-time Firestore integration.

## Tech Stack

- Frontend: React 19, Vite, TailwindCSS, Styled-components.
- Backend: Node.js, Express, Firebase (Firestore, Authentication), Socket.io.
- Database: MongoDB (Mongoose) for challenge sessions and DSA problems.
- Editor: Monaco Editor.
- Communication: Socket.io for low-latency bidirectional events.

## Getting Started

### Prerequisites

- Node.js (Version 20+ or 22+ recommended for Vite 7)
- npm or yarn
- Firebase account and MongoDB instance

### Installation

1. Clone the repository:
   git clone https://github.com/naitikcodes15/Skill-Sphere-

2. Navigate to the project directory:
   cd SkillSphere

3. Install dependencies:
   npm install
   cd backend && npm install

4. Configure environment variables:
   Create a .env file in the root and /backend directories with your Firebase, MongoDB, and API keys.

5. Seed the database:
   cd backend && node seedDsa.js

### Running Locally

1. Start the backend:
   cd backend && node server.js

2. Start the frontend:
   npm run dev

The application will be available at http://localhost:5173.

## Project Structure

- /src: React frontend source code, components, and hooks.
- /backend: Node.js server, Socket.io logic, and database models.
- /public: Static assets and icons.

## Development Roadmap

The project is evolving to include:
- Enhanced anti-cheat and navigation blocking.
- Custom challenge creation and tournament brackets.
- Detailed performance analytics and global leaderboards.
- Mobile-responsive arena optimizations.
