# 📌 TicketOps

This is a web application for ticketing built with Typescript, NodeJS, Express, Nats streaming server, Docker, and Kubernetes. The app allows users to sign up and log in, view available tickets, and purchase tickets. The app also ensures concurrency when multiple users are buying and updating tickets.

## 🚩Features

- User authentication (sign up and log in)
- View available tickets
- Purchase tickets
- Concurrency handling when multiple users are buying or updating tickets
- Dockerized for easy deployment
- Kubernetes for managing containers in a cluster

## 🚩Getting Started

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

## 🚩Tech Stack

- Typescript
- NodeJS
- Express
- Nats streaming server
- Docker
- Kubernetes

## 🚩Stack Explained

- **Typescript**: a superset of JavaScript that adds static type definitions and other features to the language
- **NodeJS**: a JavaScript runtime built on Chrome's V8 JavaScript engine that allows developers to build server-side applications in JavaScript
- **Express**: a popular web application framework for NodeJS
  Nats streaming server: a high-performance messaging system for building distributed applications
- **Docker**: a platform for building, shipping, and running applications in containers
- **Kubernetes**: an open-source system for automating deployment, scaling, and management of containerized applications
- **Skaffold** is a service more like nodemon for kubernetes, it solve many time taking steps and automate applying, pushing, and redeploying of cluster. You just need to have a proper _skaffold.yaml_ file with it's command in it, inside your project directory and run the command `skaffold dev` to start the server. It will check the file for any changes you tagged inside skaffold.yaml congig file. Remember to push the build and push the image to docker hub before running skaffold dev. If skaffold is showing some error just restart it.
- **Git submodules**
  - When you are in a repo and need to add another repo in your project.
  - This is the case to use submodules
  - Steps
    - Create a new repo
    - Copy url of the repo
    - Then run command of the parent repo `git submodule add <url> <file path>`
- **NATS Streaming Server**
  - Alternative of event bus
    - Event bus was channel via which our Microservices can talk with each other.
    - It's implementation was simple using Express and Axios
    - Wherever an event get trigger it's send to the event bus, then event bus throw that updated/event to every microservice.
    - But there were many missing functionalities
      - History queue if a service stop running for sum time. The update should be saved in some sort of queue. So that when it's live again it get updated
      - All event history, if new service in implemented it need to be updated with all the log's and data that was ever transmitted.
      - This features can be build but we already have an solution for this i.e. NATS Streaming Server. Which solves this problem and make event bus handling easier.
  - In this ticket application, NATS is being used. Ticket creation and updation for a large scale application have been made possible by it.
- **Jest**
  - Jest is used for testing.
  - Mock in jest is used to create a function that simulate/mimic the original function. It allow developer to test their code in isolation, without having to intract with complex or external dependencies.

## 🚩Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you have a suggestion or find a bug.

## 🚩License

This project is licensed under the MIT License.
