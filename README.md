# ZQ Staking Portal

## Running locally

1. Install dependencies
```sh
npm install
```
2. Run the development server
```sh
npm run dev
```
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environments

Rename selected environment to `.env` to use it with `npm run dev`.

### .env.mocked_wallet

This enables easy UX/UI workflow where you can modify the wallet states in the code to check for different scenarios.

### .env.local_zq2

This one makes the app connected to locally run docker-compose ZQ2 network. 