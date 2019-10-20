# Cricket Tech

## Overview

Code for crictec


## Requirements

Prerequisite knowledge:
Docker
JOI
Mysql
Sequelize
ESLint

Recommanded VSCode extension:

https://marketplace.visualstudio.com/items?itemName=dzannotti.vscode-babel-coloring

https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens

https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig

https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync

- NODE Version : 8.9.0
- NPM Version : 5.5.0
- Mongo:  3.0

## Getting Started

Install Mongo

For MAC OS:
```sh
brew install mongodb@3.0
```
```sh
sudo mkdir -p /data/db
sudo chown -R $USER /data/db
sudo chmod go+w /data/db
```
```sh
brew link --force mongodb@3.0
```
```sh
echo 'export PATH="/usr/local/opt/mongodb@3.0/bin:$PATH"' >> ~/.bash_profile
```

Install dependencies:

```sh
npm install
```

Set environment (vars):

```sh
cp .env.example .env
```

Start server:

```sh
# Start server
npm start
```

Tests:

```sh
# Run tests written in ES6
npm run test

# Run test along with code coverage
npm run test:coverage

# Run tests on file change
npm run test:watch

# Run tests enforcing code coverage (configured via .istanbul.yml)
npm run test:check-coverage
```

Lint:

```sh
# Lint code with ESLint
npm run lint

# Run lint on any file change
npm run lint:watch
```

Other gulp tasks:

```sh
# Wipe out dist and coverage directory
gulp clean

# Default task: Wipes out dist and coverage directory. Compiles using babel.
gulp
```

##### Deployment

```sh
# compile to ES5
1. npm run build

# upload dist/ to your server
2. scp -rp dist/ user@dest:/path

# install production dependencies only
3. npm install --production

# Use any process manager to start your services
4. pm2 start dist/index.js
```

In production you need to make sure your server is always up so you should ideally use any of the process manager recommended [here](http://expressjs.com/en/advanced/pm.html).
We recommend [pm2](http://pm2.keymetrics.io/) as it has several useful features like it can be configured to auto-start your services if system is rebooted.

## Logging

Universal logging library [winston](https://www.npmjs.com/package/winston) is used for logging. It has support for multiple transports. A transport is essentially a storage device for your logs. Each instance of a winston logger can have multiple transports configured at different levels. For example, one may want error logs to be stored in a persistent remote location (like a database), but all logs output to the console or a local file. We just log to the console for simplicity, you can configure more transports as per your requirement.

## Docker

#### Using Docker Compose for Development

```sh
# service restarts on file change
bash bin/development.sh
```

#### Building and running without Docker Compose

```bash
# To use this option you need to make sure mongodb is listening on port 27017

# Build docker
docker build -t projectPath .

# Run docker
docker run -p 4040:4040 projectPath
```
