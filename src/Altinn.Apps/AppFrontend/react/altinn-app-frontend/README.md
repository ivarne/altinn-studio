# Runtime react app
Is included in each service, and is responsible for "running" the service. Includes handling of form filling, workflow and triggering submit.

## Setup for running LocalTest with local js

1. Install dependencies for app-frontend
```bash
# cd /src/Altinn.Apps/AppFrontend/react
npm install # only needed first time, or when dependencies are updated
npm run install-deps # only needed first time, or when dependencies are updated
```
2. Start loadbalancer in docker with custom environment variable to substitute urls in html for altinncdn to point to localhost:8080
```bash
# cd src/development
export SUB_FILTER="sub_filter 'https://altinncdn.no/toolkits/altinn-app-frontend/3/'  'http://localhost:8080/';"
docker-compose up -d --build
cd ../Altinn.Apps/AppFrontend/react
npm start
```

3. Follow the normal setup [run apps locally](LOCALAPP.md) to run `LocalTest` and the `App.csproj` for the app you currently want to test.