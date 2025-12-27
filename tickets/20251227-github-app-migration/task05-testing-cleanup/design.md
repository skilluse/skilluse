# Task 05: Testing and Cleanup

## Overview

Final testing of the complete GitHub App authentication flow, cleanup of old OAuth App code, and documentation updates.

## Requirements

- End-to-end testing of all authentication flows
- Remove old OAuth App code and configuration
- Update README with new authentication flow
- Delete old OAuth App from GitHub settings

## Technical Details

### End-to-End Test Scenarios

1. **Fresh Install Flow**
   - New user runs `skilluse login`
   - Completes device flow
   - No GitHub App installation exists
   - User installs app from prompted URL
   - CLI detects new installation
   - Shows success with installation summary

2. **Returning User Flow**
   - User with existing credentials runs `skilluse login`
   - Shows "already logged in" message
   - `--force` triggers re-authentication

3. **Token Expiry Flow**
   - User runs command requiring repo access
   - Installation token is expired
   - CLI automatically refreshes token
   - Operation completes successfully

4. **Multi-Installation Flow**
   - User has app installed on personal + org accounts
   - `skilluse whoami` shows both installations
   - `skilluse repos` shows repos from both

### Code Cleanup

Remove these files/code:
- Old OAuth App Client ID constant
- Any OAuth App specific code paths
- Unused type definitions

### Documentation Updates

Update README.md sections:
- Authentication setup
- First-time login flow
- Managing repository access
- Troubleshooting auth issues

### GitHub Cleanup

- Delete old OAuth App at https://github.com/settings/developers
- Verify new GitHub App is the only auth method

## Acceptance Criteria

See features.json for testable criteria.

## Dependencies

- task04-cli-commands (all features complete)

## Out of Scope

- Automated test suite (manual testing for now)
- CI/CD integration
