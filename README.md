# TypeScript GraphQL Server Boilerplate

* Register - Confirmation email send
* Login
* Forgot Password
* Logout
* Authentication Middleware
* Rate Limiting
* Locking accounts
* Testing using Jest

## Getting Started

Fork or copy the project, created a .env file at the root of the project with the following Enviroment variables

* SPARKPOST_API_KEY - For our sparkpost client
* SESSION_SECRET - Secret for our sessions
* TWITTER_CONSUMER_KEY - Twitter Consumer Key
* TWITTER_CONSUMER_SECRET - Twitter Consumer Secret Key

## Installing

```
Yarn install
```

Or:

```
npm install
```

## Starting the server

Start the redis server (make sure you have redis installed)

```
redis-server
```

then:

```
yarn start
```

## Running the test

```
yarn test
```
