# Skilluse CLI

CLI tool for managing and installing AI Coding Agent Skills.

## Installation

```bash
npm install -g skilluse
```

## Authentication

Skilluse uses GitHub for authentication via a GitHub App. This provides secure access to your repositories with fine-grained permissions.

### First-Time Login

1. Run the login command:
   ```bash
   skilluse login
   ```

2. The CLI will provide a code and open your browser to GitHub's device activation page.

3. Enter the code when prompted by GitHub.

4. **Install the GitHub App**: If this is your first time, you'll be prompted to install the Skilluse GitHub App. Click the provided link to install it on your personal account or organization.

5. Select which repositories the app can access:
   - **All repositories**: Access to all current and future repositories
   - **Select repositories**: Choose specific repositories

6. Once installed, the CLI will automatically detect your installation and show a success message.

### Returning Users

If you're already logged in, running `skilluse login` will show your current session. Use `--force` to re-authenticate:

```bash
skilluse login --force
```

### Managing Repository Access

After initial setup, you can modify repository access at any time:

1. Go to https://github.com/settings/installations
2. Find "Skilluse" and click "Configure"
3. Update repository access permissions

To view your current repository access:

```bash
skilluse repos
```

### Checking Your Session

View your current authentication status and installations:

```bash
skilluse whoami
```

This shows:
- Your GitHub username and profile URL
- GitHub App installations (personal/organization accounts)
- Repository selection mode for each installation

### Logging Out

To clear your credentials:

```bash
skilluse logout
```

This removes:
- User OAuth token from secure storage
- All stored installations
- Cached installation tokens

## Commands

| Command | Description |
|---------|-------------|
| `skilluse login` | Authenticate with GitHub |
| `skilluse logout` | Clear stored credentials |
| `skilluse whoami` | Show current user and installations |
| `skilluse repos` | List accessible repositories |

## Security

- **User tokens** are stored in your system's secure credential storage:
  - macOS: Keychain
  - Windows: Credential Manager
  - Linux: Secret Service (libsecret)
- **Installation tokens** are short-lived (1 hour) and cached in memory
- **Repository access** is controlled entirely through GitHub's permission system

## Troubleshooting

### "No installations found"

If you see this after login:
1. Install the GitHub App from: https://github.com/apps/skilluse
2. Run `skilluse login --force` to refresh your session

### "Installation token expired"

Installation tokens auto-refresh. If you see persistent issues:
1. Check your installation is still active at https://github.com/settings/installations
2. Re-run your command

### "Not logged in"

Run `skilluse login` to authenticate.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SKILLUSE_GITHUB_CLIENT_ID` | Override the GitHub App client ID (development only) |
