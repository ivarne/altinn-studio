# Altinn 3

**Altinn Studio** is the next generation Altinn application development solution.  
Together with **Altinn Apps** and **Altinn Platform** (also part of this repo), this is a complete application development and hosting platform.

Altinn Studio is available at <https://altinn.studio>.

Read [the Altinn Studio documentation](https://docs.altinn.studio/) to get started.

![Altinn 3 concept](https://docs.altinn.studio/community/about/concept3.svg "Altinn 3 - Concept")

## Build status

### Apps

[![KubernetesWrapper build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-apps/altinn-kuberneteswrapper-build-master?label=apps/kuberneteswrapper)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=88)
[![Front-end build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-apps/altinn-app-frontend-cdn-build-master?label=apps/frontend)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=74)

### Studio

[![Designer build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-studio/designer-master?label=studio/designer)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=18)
[![Repos build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-studio/repositories-master?label=studio/repos)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=28)

### Platform

[![Authentication build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-platform/authentication-master?label=platform/authentication)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=41)
[![Authorization build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-platform/authorization-master?label=platform/authorization)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=43)
[![Events build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-platform/events-master?label=platform/events)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=136)
[![PDF build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-platform/pdf-master?label=platform/pdf)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=66)
[![Profile build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-platform/profile-master?label=platform/profile)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=38)
[![Receipt build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-platform/receipt-master?label=platform/receipt)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=58)
[![Register build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-platform/register-master?label=platform/register)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=35)
[![Storage build status](https://dev.azure.com/brreg/altinn-studio/_apis/build/status/altinn-platform/storage-master?label=platform/storage)](https://dev.azure.com/brreg/altinn-studio/_build/latest?definitionId=30)

## Developing apps?

If you just want to [run apps locally](LOCALAPP.md).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
See deployment for notes on how to deploy the project on a live system.

### Installing

Clone the [Altinn Studio repo](https://github.com/Altinn/altinn-studio) and navigate to the folder.

```bash
git clone https://github.com/Altinn/altinn-studio
cd altinn-studio
```

#### Develop Altinn Apps

To run Altinn Studio to test apps locally, follow the [Altinn Studio instructions](/src/studio/README.md).

#### Develop or run Apps

First make sure to [follow the prerequisites for Altinn Studio](/src/studio/README.md#prerequisites).  
_If you only need to develop and debug App-Frontend, you can follow the description in **step #5** (only) and deploy the app to any test environment. The App-Frontend will be loaded from your local webpack-dev-server._

It's possible to run an app locally in order to test and debug it. It needs a local version of the platform services to work.  
_NOTE: Currently, it is not possible to run Apps and Altinn Studio (designer) in parallel. To run Apps, make sure that none of the containers for Altinn Studio are running, f.ex. by navigating to the root of the altinn-studio repo, and running the command_

```bash
docker-compose down
```

#### Building other react apps

If you need to rebuild other react apps, for instance Dashboard or ServiceDevelopment, this can be done by navigating to their respective folders, example `src/react-apps/applications/dashboard` and then run the following build script

```bash
npm run build
```

Some of the react projects also have various other predefined npm tasks, which can be viewed in the `package.json` file which is located in the root folder of each react project, example `src/react-apps/applications/dashboard/package.json`

#### Platform Receipt

The platform receipt component can run locally, both in docker and manually.

##### Manual

- Open a terminal in `src/Altinn.Platform/Altinn.Platform.Receipt`
- run `npm install`
- run `npm run gulp` (if running for the first time, otherwise this can be skipped)
- run `npm run gulp-install-deps`
- run `npm run gulp-develop`

This will build and run receipt back end, and build and copy the receipt frontend to the `wwwroot` folder.
The application should now be available at `localhost:5060/receipt/{instanceOwnerId}/{instanceId}`
The script wil also listen to changes in the receipt react app, rebuild and copy the new react app to the `wwwroot` folder.

##### Docker

- Open a terminal in `src/Altinn.Platform/Altinn.Platform.Receipt`
- run `docker-compose up`
- The application should now be available at `localhost:5060/receipt/{instanceOwnerId}/{instanceId}`

## Running the tests

### End to end tests

[Integration tests](https://github.com/Altinn/altinn-studio/tree/master/src/test/cypress) for local studio.

### Coding style tests

Coding style tests are available for the React front end application, using _tslint_.

Navigate to the React front end application and run linting.

```bash
cd src/react-apps/applications/ux-editor
npm run lint
```

## Deployment

The current build is deployed in Kubernetes on Azure.

Automated build/deploy process is being developed.

## Built With

- [React](https://reactjs.org/)/[Redux](https://redux.js.org/) - The front-end framework
- [.NET Core](https://docs.microsoft.com/en-us/dotnet/core/)/[C#](https://docs.microsoft.com/en-us/dotnet/csharp/) - The back-end framework
- [npm](https://www.npmjs.com/) - Package management
- [Docker](https://www.docker.com/) - Container platform
- [Kubernetes](https://kubernetes.io/) - Container orchestration

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

- **Altinn Studio development team** - If you want to get in touch, just [create a new issue](https://github.com/Altinn/altinn-studio/issues/new).

See also the [list of contributors](https://github.com/Altinn/altinn-studio/graphs/contributors) who participated in this project.

## License

This project is licensed under the 3-Clause BSD License - see the [LICENSE.md](LICENSE.md) file for details.
