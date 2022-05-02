# MA Foundation Starter App - POC

This application is a POC of the proposed [HLD](https://quip-amazon.com/OmfQA9ehOu62/Mission-Accelerator-Starter-App-SDK-High-Level-Design) for MA Foundation SDK. This is a prototype app and you should expect to modify the source code to reflect your project needs.

## Code Coverage

| Statements | Branches | Functions | Lines |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-Unknown%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-Unknown%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-Unknown%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-Unknown%25-brightgreen.svg?style=flat) |

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Create a copy of the current folder and rename the project name in the [package.json](./package.json#L2)

```sh
cd solutions
cp example-ui-app my-awesome-app
```

After that, go and register your project in the [rush.json](../../rush.json) and run:

```sh
rush update
```

First, run the development server:

```sh
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## i18n Support

You can add multiple languages to the app by adding locales inside the **public/locales/\<lang>** folder.

In order to select a newly created language append the lang to the url:

```sh
wget http://localhost:3000/en
wget http://localhost:3000/es
wget http://localhost:3000/<lang>
```

## Design system

For the design system we are using @awsui project. More information can be found [here](https://github.com/aws/awsui-documentation)
