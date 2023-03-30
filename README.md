# TicketOps

This is a web application for ticketing built with Typescript, NodeJS, Express, Nats streaming server, Docker, and Kubernetes. The app allows users to sign up and log in, view available tickets, and purchase tickets. The app also ensures concurrency when multiple users are buying and updating tickets.

## Features

- User authentication (sign up and log in)
- View available tickets
- Purchase tickets
- Concurrency handling when multiple users are buying or updating tickets
- Dockerized for easy deployment
- Kubernetes for managing containers in a cluster

## Getting Started

To get started with the app, clone the repo:

```bash
git clone https://github.com/AnmolVerma404/TicketOps
```

Next, navigate into the repo and install the necessary dependencies:

```bash
cd TicketOps
npm install
```

<!-- To start the app, run:

npm start
The app will be available at http://localhost:3000. -->

## Tech Stack

- Typescript
- NodeJS
- Express
- Nats streaming server
- Docker
- Kubernetes

## Stack Explained

- Typescript: a superset of JavaScript that adds static type definitions and other features to the language
- NodeJS: a JavaScript runtime built on Chrome's V8 JavaScript engine that allows developers to build server-side applications in JavaScript
- Express: a popular web application framework for NodeJS
  Nats streaming server: a high-performance messaging system for building distributed applications
- Docker: a platform for building, shipping, and running applications in containers
- Kubernetes: an open-source system for automating deployment, scaling, and management of containerized applications

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you have a suggestion or find a bug.

## License

This project is licensed under the MIT License.
