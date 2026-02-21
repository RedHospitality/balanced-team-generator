# GitHub Copilot Instructions

## Development Guidelines

### 🚫 **Do NOT run the app automatically**
- Never execute `npm start` or similar commands to start the development server
- Only run the app when explicitly requested by the user

### ✅ **Allowed Commands**
- **Build**: `npm run build` - Allowed to run build commands
- **Deploy**: Deployment commands are allowed with explicit user permission
- **Tests**: `npm test` - Can run tests if they exist
- **Install**: `npm install` - Can install dependencies when needed
- **Linting**: Code quality checks are allowed

### 🔧 **Code Assistance**
- Provide code suggestions and implementations
- Help with debugging and code improvements
- Suggest best practices and optimizations
- Assist with file operations and refactoring

### 📝 **File Operations**
- Create, edit, and modify files as needed
- Help with project structure and organization
- Assist with configuration files

### ⚠️ **Important Notes**
- Always ask for permission before running deployment commands
- Respect the user's workflow and development preferences
- Focus on code quality and maintainability
- Follow React/TypeScript best practices