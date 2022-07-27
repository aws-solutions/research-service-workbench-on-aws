# Authorization

# Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-100%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-100%25-brightgreen.svg?style=flat) |

## Description
The authorization component is a flexible and extensible RBAC(role base access control) typescript library. It is designed using the plugin-architecture to allow for developers to easily implement and extend this library. This authorization component currently functions at the route based level.

## How to use

### Components

#### Permission

A role will have a set of `Permission`. Each `Permission` will have the following attributes: effect,   action, and subject. It could optionally contain a fields attribute. The `effect` will determine whether the role has `ALLOW` or `DENY` access for this permission. An `action` attribute can only be assigned one of the words from CRUD (`CREATE`, `READ`, `UPDATE`, `DELETE`).  The `subject` represents the item in which the user wants to perform the action on. The optional `fields` attribute allows for access restriction to a subject's field (ex: a `description` would be a `field` of a `Blog` in which `UPDATE` access should be only `ALLOW` to certain roles).
#### Operation

A route that is being checked for authorization will have a set of `Operation`. Each Operation will have the following attributes: action and subject. It could optionally contain a field attribute. The `action` represents the required CRUD word for this route. The `subject` is what the route performs the action on. If a `field` is given, then it represents the field of a subject that the action will be performed on. 

#### Create a set of Permissions for each role.
```ts
const guestPermissions: Permissions[] = [
	{
		effect: 'ALLOW',
		action: 'CREATE',
		subject: 'Blog'
	},
	{
		effect: 'DENY'
		action: 'UPDATE',
		subject: 'Subscription'
	}
];
const adminPermissions: Permissions[] = [
	{
		effect: 'ALLOW',
		action: 'CREATE',
		subject: 'Blog'
	},
	{
		effect: 'ALLOW'
		action: 'UPDATE',
		subject: 'Subscription'
	}
];
```
#### Create a permissions map
```ts
const permissionsMap: PermissionsMap = {
	guest: guestPermissions,
	admin: adminPermissions
	// Include more roles if needed
};
```
### 2. Define Operations

#### Create a routes map
This will map a route with an associated `HTTPMethod` to a set of `Operations` that need to be performed by that route.
```ts
const blogPostOperations: Operation[] =  [
	{
		action: 'CREATE',
		subject: 'Blog'
	}
];
const subscriptionPutOperations: Operation[] = [
	{
		action: 'UPDATE',
		subject: 'Subscription'
	}
];
const routesMap: RoutesMap = {
	'/blog': {
		'POST': blogPostOperations
	},
	'/subscription' {
		'PUT': subscriptionPutOperations
	}
};
```

#### Indicate which route should be ignored from authorization
```ts
const routesIgnored: RoutesIgnored = {
	'/blog': {
		'GET': true
	}
};
```
### 3. Create a StaticPermissionsPlugin
The StaticPermissionsPlugin is a PermissionsPlugin for the Authorization Service and helps manage the permissions for each role. Permissions defined with this plugin are meant to be static.
```ts
//StaticPermissionsPlugin requires a LoggingService to enable logging.
const logger:LoggingService = new LoggingService();
const staticPermissionsPlugin:StaticPermissionsPlugin = new  StaticPermissionsPlugin(
	mockPermissionsMap,
	routesMap,
	routesIgnored,
	logger
);
```
#### Alternative PermissionsPlugin

While the StaticPermissionsPlugin is a reference implementation, you are welcome to implement your own PermissionsPlugin to create more dynamic permissions mapping.

### 4. Create a CASLAuthorizationPlugin
The CASLAuthorizationPlugin is an AuthorizationPlugin for the AuthorizationService and helps determine if a AuthenticatedUser can do a set Operations with their set of Permissions. The CASLAuthorizationPlugin uses [CASL](https://casl.js.org/v5/en/), an open-source authorization javascript library. 

> CASL (pronounced /ˈkæsəl/, like **castle**) is an isomorphic authorization JavaScript library which restricts what resources a given user is allowed to access. It's designed to be incrementally adoptable and can easily scale between a simple claim based and fully featured subject and attribute based authorization. It makes it easy to manage and share permissions across UI components, API services, and database queries.

```ts
const caslAuthorizationPlugin: CASLAuthorizationPlugin = new CASLAuthorizationPlugin();
```

### Alternative to AuthorizationPlugin

While the CASLAuthorizationPlugin is a reference implementation, you are welcome to implement your own AuthorizationPlugin.

### 5. Create the Authorization Service
The AuthorizationService is the core service of this library. It requires a PermissionsPlugin and AuthorizationPlugin in order to use it.

```ts
const authorizationService:AuthorizationService = new AuthorizationService(
	caslAuthorizationPlugin,
	staticPermissionsPlugin
);
```
### 6. Utilize isAuthorizedOnRoute from AuthorizationService
`isAuthorizedOnRoute` requires a [AuthenticatedUser](https://github.com/awslabs/monorepo-for-service-workbench/blob/main/workbench-core/authentication/src/authenticatedUser.ts) and the route and method they are trying to access. This request will throw an `Error` if a user is not authorized.
```ts
const guestUser:AuthenticatedUser = {
	id: 'sampleId',
	roles: ['guest']
}
try {
	// This states that a guest user is requesting to POST to /blog
	authorizationService.isAuthorizedOnRoute(guestUser, '/blog', 'POST');
} catch(err) {
	console.log(err);
}
```

## Integrating with ExpressJS using Middleware
Authorization implemented as a middleware is a common use case. This library contains an authorization middleware that integrates with ExpressJS. The middleware expects an [AuthenticatedUser](https://github.com/awslabs/monorepo-for-service-workbench/blob/main/workbench-core/authentication/src/authenticatedUser.ts) to be made availabe to it by using the [local variables](https://expressjs.com/en/api.html#res.locals) of ExpressJS. 
```ts
const app = express();

// This example shows an authorization middleware with no mount path. Authorization will execute every time a request is received
app.use(WithAuth(authorizationService));
```
**REQUIRED**:The middleware function needs to be mounted at the [app](https://expressjs.com/en/guide/using-middleware.html#middleware.application) level with no path, as it should execute every time a request is received. Click [here](https://expressjs.com/en/guide/using-middleware.html) for more information about ExpressJS middleware.
