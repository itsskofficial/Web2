# Projects/VideoFun/README.md
<p align="center">

  <h3 align="center">VideoFun</h3>

  <p align="center">
    A full-stack video-sharing application inspired by TikTok, allowing users to share short videos, interact with content, and follow other creators.
    <br/>
    <a href="https://github.com/itsskofficial/Web2/issues">Report Bug</a>
    ·
    <a href="https://github.com/itsskofficial/Web2/issues">Request Feature</a>
  </p>
</p>

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Table Of Contents

* [About the Project](#about-the-project)
* [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Future Improvements](#future-improvements)
* [Contributing](#contributing)
* [License](#license)
* [Authors](#authors)

## About The Project

VideoFun is a modern, full-stack video-sharing platform designed for creating and sharing short-form video content. It features a user-friendly interface for browsing an endless feed of videos, uploading new content, and interacting with other users through likes and comments. The application is built with a scalable backend and a reactive frontend, providing a seamless and engaging user experience.

## Built With

This project was built with a modern, high-performance tech stack.

*   [React](https://react.dev/) (with Vite and TypeScript)
*   [NestJS](https://nestjs.com/) (TypeScript)
*   [GraphQL](https://graphql.org/) (with Apollo)
*   [PostgreSQL](https://www.postgresql.org/) (with Prisma)
*   [Docker](https://www.docker.com/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Zustand](https://zustand-demo.pmnd.rs/)
*   [Apollo Client](https://www.apollographql.com/docs/react/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You will need the following software installed on your machine:
*   [Docker](https://www.docker.com/get-started/) and Docker Compose
*   [Node.js](https://nodejs.org/) (v18+)

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/itsskofficial/Web2.git
    cd videofun
    ```

2.  **Backend Setup**
    *   Navigate to the backend directory:
        ```sh
        cd backend
        ```
    *   Start the PostgreSQL database using Docker:
        ```sh
        docker-compose up -d
        ```
    *   Create a `.env` file from the template:
        ```sh
        cp .env.template .env
        ```
    *   Update the `.env` file with your database connection string and JWT secrets. The default database URL for the Docker setup is:
        ```
        DATABASE_URL="postgresql://johndoe:123@localhost:5432/mydb?schema=public"
        ```
    *   Install dependencies:
        ```sh
        npm install
        ```
    *   Run database migrations:
        ```sh
        npx prisma migrate dev
        ```
    *   Start the backend server:
        ```sh
        npm run start:dev
        ```
    *   The backend will be running at **[http://localhost:3001](http://localhost:3001)** and the GraphQL playground at **[http://localhost:3001/graphql](http://localhost:3001/graphql)**.

3.  **Frontend Setup**
    *   In a new terminal, navigate to the frontend directory:
        ```sh
        cd frontend
        ```
    *   Install dependencies:
        ```sh
        npm install
        ```
    *   Start the frontend development server:
        ```sh
        npm run dev
        ```
    *   The application will be available at **[http://localhost:5174](http://localhost:5174)**.

## Usage

Once the application is running, you can:
*   Create an account or log in to your existing account.
*   Scroll through the main feed to discover videos from other users.
*   Upload your own videos with captions.
*   Visit user profiles to see their content and follow them.
*   Like and comment on videos to interact with the community.
*   Edit your user profile, including your name, bio, and profile picture.

## Future Improvements

*   **AI-Powered "For You" Feed:** Implement a recommendation algorithm to personalize the user's video feed.
*   **Direct Messaging:** Add a real-time chat feature for users to communicate directly.
*   **Live Streaming:** Allow users to broadcast live video streams to their followers.
*   **Advanced Video Filters & Effects:** Integrate a video editor with filters, effects, and text overlays.
*   **Hashtag & Sound Pages:** Create dedicated pages for trending hashtags and sounds.
*   **Stitch & Duet Features:** Allow users to create content that incorporates other users' videos.
*   **Comprehensive Test Coverage:** Implement a full suite of backend (Jest) and frontend (Vitest/Cypress) tests.
*   **CI/CD & Cloud Deployment:** Set up a continuous integration and deployment pipeline to a cloud provider like Vercel or AWS.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the repository a star! Thanks again!

### Creating A Pull Request

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE.md` for more information.

