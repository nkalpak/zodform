# ZodForm

A library for building forms in React in a declarative way using a `zod` schema.

[See docs](https://zodform.vercel.app/).

# Installation

This repo is a [Rush](https://rushjs.io/) monorepo, so you'll need to install `@microsoft/rush` globally:

```bash
npm install -g @microsoft/rush
```

Once you have Rush installed, you can install the dependencies:

```bash
rush update
```

## Repos

- `@zodform/core` - the logic for rendering components from a schema
- `@zodform/docs` - the docs site
- `@zodform/mantine` - a [Mantine](https://mantine.dev/) theme for the components

Most of the development is usually done in `@zodform/core`.
Navigate to `apps/core` and run:
- `rushx test` to run the tests
- `rushx stories` to run the stories
