# Audiophile E-commerce App

## For a full documentation of the project, click on the link bellow
[Documentation](https://deepwiki.com/Eric-Obeng/audiophile-ecommerce-app)

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0.

## Project Overview

Audiophile is a modern e-commerce application for audio equipment, featuring:

- Product catalog with categories (headphones, speakers, earphones)
- Detailed product pages with specifications and images
- Shopping cart functionality
- Checkout process
- Responsive design for mobile, tablet, and desktop

The application uses Supabase as a backend database and storage solution.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Environment Setup

This project uses environment files for configuration. To set up your environment:

1. Copy the template files to create your environment files:

```bash
cp src/environments/environment.template.ts src/environments/environment.ts
cp src/environments/environment.development.template.ts src/environments/environment.development.ts
cp .env.template .env
```

1. Update these files with your Supabase credentials:
   - For Angular environment files: Add your Supabase URL and anon key
   - For .env file: Add your Supabase URL and service key (for migration scripts)

## Supabase Setup

This project uses Supabase for data storage. Follow these steps:

1. Create a Supabase account and project at [supabase.com](https://supabase.com/)
2. Set up tables using the SQL scripts in the `scripts` directory
3. Migrate data from the local JSON file to Supabase using the migration script
4. Configure RLS policies using the SQL scripts

See the [README in the scripts directory](./scripts/README.md) for detailed instructions.

## GitHub Guidelines

When pushing to GitHub, be aware of the following:

### What to Push

- All source code files
- Template files for environments (.env.template, \*.template.ts)
- SQL scripts and migration scripts
- Documentation

### What NOT to Push

- Environment files with actual credentials (.env, environment.ts, etc.)
- Node modules and build artifacts
- Editor-specific files

The .gitignore file is configured to exclude sensitive files by default. Always verify what you're committing before pushing to ensure sensitive information is not exposed.
