<!-- README.md -->
<br/>
<p align="center">
  <h3 align="center">Sketchify</h3>

  <p align="center">
    An AI-powered SaaS application that transforms wireframe sketches into production-ready code.
    <br/>
    <br/>
    <a href="https://github.com/itsskofficial/Web2/issues">Report Bug</a>
    .
    <a href="https://github.com/itsskofficial/Web2/issues">Request Feature</a>
  </p>
</p>

![License](https://img.shields.io/github/license/itsskofficial/Web2) 

## Table Of Contents

* [About the Project](#about-the-project)
* [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Contributing](#contributing)
* [License](#license)
* [Acknowledgements](#acknowledgements)

## About The Project

Sketchify is a full-stack SaaS application designed for designers and developers to accelerate the UI development process. It provides a digital canvas where users can sketch wireframes, generate a complete design system from a mood board, and then leverage the power of AI to convert these sketches into fully-styled, production-ready HTML and CSS code in real-time.

Key features include:
*   An infinite canvas for sketching wireframes with various tools.
*   AI-powered style guide generation from mood board images.
*   Real-time streaming of AI-generated code directly onto the canvas.
*   Interactive design chat to iteratively refine AI-generated components.
*   A complete subscription and credit system for monetization.

## Built With

This project is built with a modern, scalable tech stack designed for performance and real-time capabilities.

*   [Next.js](https://nextjs.org/)
*   [React](https://react.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Convex](https://www.convex.dev/)
*   [Redux Toolkit](https://redux-toolkit.js.org/)
*   [Anthropic API (via Vercel AI SDK)](https://sdk.vercel.ai/)
*   [Polar](https://polar.sh/)
*   [Ingest](https://www.inngest.com/)
*   [Shadcn/UI](https://ui.shadcn.com/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   **Node.js:**
  
  Ensure you have Node.js (v18 or later) installed.

  ```sh
  # To check if Node.js is installed, run:
  node -v
  ```
  You can download it from [https://nodejs.org/](https://nodejs.org/).

*   **Environment Variables**

  You will need to sign up for accounts with the following services to get the necessary API keys:
    *   Convex
    *   Clerk (for authentication)
    *   Anthropic (for AI models)
    *   Polar (for payments)
    *   Ingest (for background jobs)

### Installation

1.  **Clone the repo**

    ```sh
    git clone https://github.com/itsskofficial/Web2.git
    ```

2.  **Enter into the directory**
    ```sh
    cd Web2 
    ```

3.  **Install npm packages**

    ```sh
    npm install
    ```
4.  **Set up Environment Variables**

    Create a `.env.local` file in the root of the project and add the necessary API keys and configuration variables. Use the `.env.example` file as a template.

    ```    # .env.local

    # Convex
    CONVEX_DEPLOYMENT=
    NEXT_PUBLIC_CONVEX_URL=

    # Clerk Auth
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=

    # Anthropic AI
    ANTHROPIC_API_KEY=

    # Polar Payments
    POLAR_ACCESS_TOKEN=
    POLAR_WEBHOOK_SECRET=
    NEXT_PUBLIC_POLAR_PLAN_ID=

    # Ingest
    INGEST_SIGNING_KEY=
    INGEST_EVENT_KEY=
    
    # App URL
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

5.  **Run the development server**

   ```sh
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

Sketchify serves as a powerful tool for designers to bring their ideas to life without writing code. 

1.  **Create a Project:** After signing in, create a new project from your dashboard.
2.  **Build a Style Guide:** Navigate to the Style Guide tab, upload inspiration images to the mood board, and use the "Generate with AI" feature to create a unique color palette and typography system.
3.  **Sketch a Wireframe:** Go to the canvas, create a frame, and use the drawing tools to sketch out your UI wireframe.
4.  **Generate Design:** Click the "Generate Design" button on the frame. The AI will use your sketch and the project's style guide to generate a fully styled component in real-time.
5.  **Iterate with Chat:** Use the design chat to make conversational requests and refine the generated UI until it's perfect.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the repository a star! Thanks again!

### Creating A Pull Request

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See [LICENSE](https://github.com/itsskofficial/Machine-Learning/blob/main/LICENSE.md) for more information.

## Acknowledgements

This project would not have been possible without the incredible tools and services provided by the following:

*   [Convex](https://www.convex.dev/)
*   [Vercel AI SDK](https://sdk.vercel.ai/)
*   [Anthropic](https://www.anthropic.com/)
*   [Polar](https://polar.sh/)
*   [Ingest](https://www.inngest.com/)
*   [Shadcn/UI](https://ui.shadcn.com/)
*   [Web Prodigies](https://webprodigies.com/)