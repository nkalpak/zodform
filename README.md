# ZodForm

A library for building forms in React in a declarative way using a `zod` schema.

## What it is

ZodForm is meant to integrate form building into your existing `zod` workflows.

As it stands currently, building a form in a Typescript powered React app means:
- Writing a form schema using `zod`
- Using a form data management library such as `react-hook-form` to manage the form state
- Writing the markup for the form inputs, and wiring up the event handlers, error messages, etc. to the form library

Using a form data management library gives you all the power to decide how to render the form.
This is great when you need that power, but it would be nice to have a solution that doesn't
require you to manually wire up the entire form. ZodForm tries to be that solution.

## What it isn't

1. ZodForm is not a replacement for `react-hook-form` or similar libraries which give you full control over rendering.
ZodForm makes the necessary tradeoff where flexibility is traded for ease of use. So if you have a very complex form
where you would like to have full control over the rendering, you should probably consider using something that
doesn't put constraints on rendering the form
2. ZodForm is not a replacement for JSON schema form libraries.
ZodForm is very much inspired by libraries such as [jsonforms](https://jsonforms.io/) and
[react-jsonschema-form](https://react-jsonschema-form.readthedocs.io/en/latest/), though it makes different tradeoffs
when compared to these libraries:
   1. ZodForm is TypeScript focused, it isn't portable across languages like JSON schema is
   2. JSON schema is just data, it doesn't depend on any runtime and as such can be stored in a datastore.
   ZodForm uses runtime features (such as functions) to generate the form, so it isn't serializable and as such
   cannot be stored in a datastore

# Run locally

1. Clone the repo
2. `pnpm i` to install dependencies
3. `pnpm run stories` to preview the stories
4. Check out the code for the stories in `src/stories`
