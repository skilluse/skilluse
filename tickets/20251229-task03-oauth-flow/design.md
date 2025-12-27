# GitHub OAuth Device Flow

## Overview
Implement GitHub OAuth Device Flow authentication for CLI usage (no client secret required).

## Requirements
- Implement Device Flow OAuth process
- Display user code and verification URL
- Poll for authentication completion
- Handle timeout and error cases

## Technical Details

### OAuth Device Flow Steps
1. Request device code from GitHub
2. Display user code and URL to user
3. Open browser automatically (optional)
4. Poll for access token
5. Store token securely

### API Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| POST | https://github.com/login/device/code | Request device code |
| POST | https://github.com/login/oauth/access_token | Poll for token |

### Dependencies
- @octokit/auth-oauth-device
- open (for browser)

### OAuth Flow Response
```typescript
interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}
```

## Acceptance Criteria
See `features.json` for testable criteria.

## Ticket Dependencies
- [x] task01-project-setup

## Out of Scope
- Token storage (task05)
- Login/logout commands (task04)
- Token refresh logic
