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
- /bar -> rate limited endpoint, access allowed only for "client-1" | "client-2"
- /foo -> rate limited endpoint, access allowed only for "client-1" | "client-2"

### Configs:
- By default, /bar is configured to use the Token Bucket Rate Limiter algorithm and it has different configs for "client-1" and "clent-2"
- By default, /foo is configured to use the Sliding Window Log Rate Limiter and it has different configs for "client-1" and "clent-2"

### For the default configs, the following requests can be tested
- curl -i -H "Authorization: Bearer client-1" http://localhost:3000/bar
- curl -i -H "Authorization: Bearer client-2" http://localhost:3000/bar
- curl -i -H "Authorization: Bearer client-1" http://localhost:3000/foo
- curl -i -H "Authorization: Bearer client-2" http://localhost:3000/foo

#####  In order to update the configs, src/config/clients.ts may be used. If the app was started using npm start, a manual npm run build and npm start will be required for the changes to take place. If the app was started using npm run dev, the restart will happen automaticaly by leveraging nodemon and ts-node
