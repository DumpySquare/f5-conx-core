# Introduction

The f5-conx-core, is a project intended to support all the basic connectivity with F5 productions within the JavaScript/TypeScript(JS/TS) language eccosystem.

This includes fully abstracting underlying connectivity authentication, information gathering and (A)utomated (T)ool (C)hain management.

- Manage connectivity with F5 products, including:
  - BIG-IP, BIG-IQ and iHealth
  - Future plans of supporting:
    - Beacon?
    - nginx?
  - upload/download files including:
    - generating ucs/qkviews
    - installation of ATC services
  - ATC Service management, includugin:
    - download/upload of ATC ILX RPM packages
    - install/uninstall of ATC ILX RPM packages
  - ATC interaction including
    - GET/POST/PATCH/DELETE of all ATC services
- Network transport support for IPv4 and IPv6
- Network connectivity statistics including:
  - Time it took for dns to resolve
  - Time it took to connect to tcp socket
  - Time it took to negotiate SSL
  - When request was made
  - When the first byte was recieved
  - and when everything completed

## Table of Contents

- [Usage](#usage)
- [New-Work](#new-work)
- [New Work Phase 2](#new-word-phase-2)
- [User Documentation](#user-documentation)


---

## New Work

The high level goal here is to make an HTTP client that supports everything we need to take our tools to the next level.

### http-timer for axios requests

https://github.com/szmarczak/http-timer

The above plugin adds the following timings object to the response of axios
```typescript
export interface Timings {
    start: number;
    socket?: number;
    lookup?: number;
    connect?: number;
    secureConnect?: number;
    upload?: number;
    response?: number;
    end?: number;
    error?: number;
    abort?: number;
    phases: {
        wait?: number;
        dns?: number;
        tcp?: number;
        tls?: number;
        request?: number;
        firstByte?: number;
        download?: number;
        total?: number;
    };
}
```

### new HTTP Response type including the timings
```typescript
export type HttpResponse = {
    data?: unknown;
    headers?: unknown;
    status: number;
    statusText?: string;
    request?: {
        url: string;
        method: string;
        headers: unknown;
        protocol: string;
        timings: Timings;
        // data?: unknown;
    };
};
```

Using these timings we can log and provide stats about what devices (mainly f5) are responding slower than other or a gathered base line

### Upgrades!
- Full request timings:  (DONE)
  - See timing details above
  - tests updated and working
- token timer  (DONE)
  - Read token TTL and utilize for entire lifetime of token
  - refresh automatically as needed
  - probably need to add more error handling, but this is a good start
  - tests updated and working
- Added support for supplying remote authentication provider (DONE)
  - If none is supplied, the default 'local' is set
- IPv6 support (DONE)
  - Tests with basic usage/connectivity
- Added additional response details necessary for upper layer integration, like request details and full response details (DONE)
- proxy support for external calls for things like accessing github/iHealth


### Further plans (mostly in priority...)
- Update logger to accept mutiple parameters
- layered functions that do all the work of uploading/downloadin files and capturing ucs/qkviews
- Expand ils rpm installs to monitor restjavad/restnoded processes to complete restart for job completion
  - Currently only seems to make sure the install process completed, not that the services have restarted and are ready for processing again.
  - This needs to be monitored so other processes are not trying to use the service while it's restarting.  Depending on the host f5 config size and resources, this can take anywhere between 20 and 90 seconds.
- bigiq specific support
  - confirm installing/uninstalling of ATC service (fast/as3/do/ts)
    - has different api... :(
  - confirm file upload/download
  - confirm bigiq ucs/qkview generation
  - service discovery
  - can we get the necessary details from the same CDN network?
- Service discovery for ATC (maybe?)
  - What services are installed
- Support both http and https connections (maybe?)
  - When connecting to an F5 device only HTTPS will be used
  - But there may be use cases where http is necessary for some sort of external connection
- May leave open the option for connecting over a linux socket also... (maybe?)
- Possible support for following redirects
  - Should be part of axios client (just need to document how to use it)
- Support for failed auth events (probably not)
  - This is to allow the packege to be consumed by any other service, like a command line tool, but also be able to integrate into the vscode extension to clear password cache when authentication fails
  - Thinking more on this, it should probably be handled by whatever is utilizing the sdk

---

## New Work Phase 2

Is to really take a step back and outline the different workflows we intent to support and architecte those functions accordingly

I like the idea of having a main parent class that represends the core of connecting to the device.  Programs can then manage multiple devices at once, with a mgmtClient for each device

> nginx is gonna need to be included at some point.  It probably makes sense to make a nginx mgmt class with its respective details and connectivity

Information like:
- device(ip/host)/port/username/password/provider(done)

Then discover information about the device
- bigip/bigiq (even nginx?)(done)
- host info (platform, tmos version, license information)(done)
- installed ATC services(done)
- ATC service metadata (stuff from the CDN (or local cache), verion info, download links general endpoints)(started)

And provide basic manipulation:
- upload/download files(done)
- generate/download ucs/qkviews
- ATC RPM get/put and service install/uninstall
- ATC service interaction
  - help facilitate posting async AS3
  - or DO
  - or Deleting a single AS3 tenant from a bigiq target
  - even just getting and posting simple ts  


With this approach it seems that we can adjust the manement class to create/modify functions depending on certain situations.  Mainly the differences when working with a bigiq and bigiq.  We can creat a main deviceMgmt class instantiate it with credentials, then run a `load` or `discover` function to test connectivity, credentials and gather necessary information about the device.  With this information we could over write some of the functions or parameters to handle the differences in functionality.  Mainly, file upload/download, AS3 interactions, ... I wonder if we have the same issue with DO/TS, where bigiq can manage those services with the "target" paramters...


https://stackoverflow.com/questions/21243790/is-it-possible-to-redefine-a-javascript-classs-method

So, the question is, overwrite with prototypes or look at class inheritance?

https://stackoverflow.com/questions/6885404/javascript-override-methods
https://medium.com/javascript-scene/master-the-javascript-interview-what-s-the-difference-between-class-prototypal-inheritance-e4cd0a7562e9

I see a way to have the parent mgmtClient class, then add on additional classes within to provide the different bolt on funtionality

If you made it this far...  Ended up wrapping all the classes in a top level f5Device class that includes the f5mgmt class for all connectivity, if different ATC services are discovered running on the device, then classes for each respective service are instantiated with the mgmt class for connectivity details and attached to the parent f5Device class.

This provide a single object for connecting to and managing a single device.  If tools need to be able to manage connectivity between multiple devices, each device gets it's own class and everything is in a nice package

---

## Usage

Basic Example:
```javascript
const ManagementClient = require('f5-sdk-js').bigip.ManagementClient;
const AS3Client = require('f5-sdk-js').bigip.extension.AS3Client;

const mgmtClient = new ManagementClient({
    host: '192.0.2.1',
    port: 443,
    user: 'admin',
    password: 'admin'
})
await mgmtClient.login();

const extensionClient = new AS3Client(mgmtClient);
await extensionClient.service.create({ config: {} });
```

Typescript Import Example:
```typescript
import { bigip } from 'f5-sdk-js';

const ManagementClient = bigip.ManagementClient;
const AS3Client = bigip.extension.AS3Client;
```

## Contributor Documentation

A collection of helpful commands have been added to the package manager (npm) scripts directive. Check out the `package.json` for an up-to-date list of commands. 

- Build Package (Typescript -> Javascript): `npm run build-package`
- Build Code Documentation: `npm run build-code-docs`
- Run Unit Tests: `npm run test`
- Run Linter: `npm run lint`

Note that the `main` and `types` package manager directive are pointed at the `dist` folder (where `tsc` builds the package). Please ensure any published packages builds and includes that folder.

## Source Repository

See the source repository [here](https://github.com/f5devcentral/f5-sdk-js).

## User Documentation

The F5 SDK (JS) is in public preview. Documentation for this SDK is coming soon to [clouddocs.f5.com](https://clouddocs.f5.com/). If you have a specific documentation request, you can file an issue through GitHub.

## Filing Issues and Getting Help

If you come across a bug or other issue when using the SDK, use [GitHub Issues](https://github.com/f5devcentral/f5-sdk-js/issues) to submit an issue for our team. You can also see the current known issues on that page, which are tagged with a Known Issue label.  

F5 SDK is community-supported. For more information, see the [Support page](SUPPORT.md).

## Copyright

Copyright 2014-2020 F5 Networks Inc.

### F5 Networks Contributor License Agreement

Before you start contributing to any project sponsored by F5 Networks, Inc. (F5) on GitHub, you will need to sign a Contributor License Agreement (CLA).  

If you are signing as an individual, we recommend that you talk to your employer (if applicable) before signing the CLA since some employment agreements may have restrictions on your contributions to other projects. Otherwise by submitting a CLA you represent that you are legally entitled to grant the licenses recited therein.  

If your employer has rights to intellectual property that you create, such as your contributions, you represent that you have received permission to make contributions on behalf of that employer, that your employer has waived such rights for your contributions, or that your employer has executed a separate CLA with F5.

If you are signing on behalf of a company, you represent that you are legally entitled to grant the license recited therein. You represent further that each employee of the entity that submits contributions is authorized to submit such contributions on behalf of the entity pursuant to the CLA.
