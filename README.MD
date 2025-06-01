## Instructions to build and run the project:
1. Have Node.js installed - https://nodejs.org/en/download
2. Clone the git repository
3. (Optional) Setup a local ".env" file in the root of the project, with configs setup like in the ".env.example" file
3. npm install
4. npm run build
5. npm start


## Available endpoints:
- / -> shows a generic message indicating the available Rate Limited endpoints
- /health -> for Cloud deployment
- /bar -> by default, configured for "client-1" with the Token Bucket Rate Limiter algorithm
- /foo -> by default, configured for "client-2" with the Sliding Window Log Rate Limiter algorithm

### For the default configs, the following requests can be made
curl -i -H "Authorization: Bearer client-1" http://localhost:3000/bar
curl -i -H "Authorization: Bearer client-2" http://localhost:3000/foo

### In order to update the configs, src/config/clients.ts may be used. If the app was started using npm start, a manual npm run build and npm start will be required for the changes to take place. If the app was started using npm run dev, the restart will happen automaticaly by leveraging nodemon and ts-node
