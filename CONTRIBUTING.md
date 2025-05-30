# Contributing to theOxus

Thank you for considering contributing to theOxus! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We are committed to providing a welcoming and inspiring community for all. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

- Before creating a new bug report, please check the existing Issues to see if the problem has already been reported
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the problem
- Provide screenshots or screen recordings if applicable
- Include information about your environment (operating system, browser version, Node.js version)
- Tag the issue with appropriate labels

### Suggesting Features

- Check if the feature has already been suggested in the Issues section
- Use the feature request template to create a new issue
- Describe the feature in detail and explain why it would be valuable to the project
- Consider how the feature aligns with the project's goals and philosophy
- If possible, outline a technical approach or implementation strategy

### Code Contributions

1. Find an issue to work on or create one to discuss your proposed changes
2. Fork the repository
3. Create a new branch from `main` for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Implement your changes
5. Write or update tests as needed
6. Ensure your code follows the project's coding style and passes all linting
7. Make sure all tests pass:
   ```bash
   npm run test
   ```
8. Commit your changes following the commit message guidelines
9. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
10. Submit a pull request to the main repository

## Development Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/theoxus.git
   cd theoxus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   MISTRAL_API_KEY=your_mistral_api_key  # Optional, for AI ranking features
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at http://localhost:5000

## Coding Guidelines

### General Guidelines

- Use TypeScript for all code files
- Follow the existing code style and formatting
- Write clear, descriptive variable and function names
- Add comments for complex logic
- Keep components small and focused on a single responsibility
- Use proper typing for all variables and functions
- Document exported functions, types, and classes

### Frontend Guidelines

- Use functional components with hooks instead of class components
- Keep state management simple and use React Query for data fetching
- Follow the component structure in the codebase
- Use the ShadCN UI components for consistent design
- Add proper accessibility attributes
- Ensure responsive design for all new components

### Backend Guidelines

- Maintain a clear separation of concerns
- Use the established pattern for API endpoints
- Validate all inputs using Zod schemas
- Handle errors properly and provide meaningful error messages
- Document APIs and data models
- Test new endpoints thoroughly

## Pull Request Process

1. Update relevant documentation (including README.md) for any changes
2. Add or update tests for the changes
3. Ensure all checks pass on your PR (linting, tests, build)
4. Request a review from at least one maintainer
5. Address any feedback from reviewers
6. Once approved, a maintainer will merge your PR

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools

Examples:
- `feat: add country flags to news sources`
- `fix: resolve issue with news ticker on mobile devices`
- `docs: update API documentation`

## License and Copyright

By contributing to theOxus, you agree that your contributions will be licensed under the project's Apache-2.0 license. All contributions should comply with the license terms.

## Questions?

If you have any questions about contributing, please open an issue with the label "question" or reach out to the maintainers.

Thank you for your contributions to making theOxus better for everyone!