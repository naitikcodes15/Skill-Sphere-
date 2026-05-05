# SkillSphere

SkillSphere is a professional real-time 1v1 coding challenge platform designed for competitive programming and skill assessment. The platform enables developers to engage in live coding battles, providing a synchronized environment for multiple programming languages.

> [!CAUTION]
> This project is currently in development. Certain features have been intentionally reserved for future implementation and may not be fully functional in the current version.

## Core Features

- Real-time 1v1 competitive coding arena.
- Multi-language support including C, C++, Java, Python, and JavaScript.
- Seamless code synchronization between participants.
- Real-time opponent activity tracking and status updates.
- Integrated high-performance code editor powered by Monaco.
- Robust challenge management and skip functionality.
- Professional DSA question database with categorized difficulty levels.

## Tech Stack

- Frontend: React 19, Vite, TailwindCSS, Styled-components.
- Backend: Node.js, Firebase (Firestore, Authentication), Socket.io.
- Editor: Monaco Editor.
- State Management and Routing: React Router, React Context API.
- Communication: Socket.io for real-time bidirectional events.

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn
- Firebase account for database and authentication setup

### Installation

1. Clone the repository:
   git clone https://github.com/naitikcodes15/Skill-Sphere-

2. Navigate to the project directory:
   cd SkillSphere

3. Install dependencies:
   npm install

4. Configure environment variables:
   Create a .env file in the root directory and add your Firebase and API configurations.

### Running Locally

To start the development server:
npm run dev

The application will be available at http://localhost:5173.

## Project Structure

- /src: Frontend source code, including components, pages, and context.
- /backend: Backend services and configurations.
- /public: Static assets and public resources.

## Development Status

The project is actively being developed to include advanced features such as:
- Enhanced anti-cheat mechanisms.
- Expanded problem sets and custom challenge creation.
- Detailed performance analytics for participants.
- Tournament mode and global leaderboards.
