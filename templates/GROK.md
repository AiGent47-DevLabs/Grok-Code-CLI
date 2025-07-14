# GROK.md - Default Project Context

## About This File
This is a template GROK.md file. Create your own GROK.md in:
- `~/GROK.md` - For global context across all projects
- `./GROK.md` - For project-specific context

## What to Include
- Project conventions and standards
- Preferred libraries and frameworks
- Code style guidelines
- Security requirements
- Performance considerations
- Testing strategies

## Example Context

### Code Style
- Use 2 spaces for indentation
- Prefer async/await over callbacks
- Always handle errors appropriately
- Write descriptive variable names

### Security
- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries for databases
- Follow OWASP guidelines

### Project Structure
```
src/
  components/   # React components
  utils/        # Helper functions
  api/          # API calls
  types/        # TypeScript definitions
tests/          # Test files
docs/           # Documentation
```

Remember: GROK will use this context to better understand your project needs!