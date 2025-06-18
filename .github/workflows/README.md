# GitHub Actions Secret Configuration Guide

This document outlines the secrets that need to be configured in your GitHub repository for the automated workflows to function properly.

## 🔐 Required Secrets

Navigate to your repository → Settings → Secrets and variables → Actions → New repository secret

### Docker Hub Integration
```
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password-or-token
```

### Expo/EAS Build
```
EXPO_TOKEN=your-expo-access-token
EXPO_ANDROID_KEYSTORE_PASSWORD=your-android-keystore-password
EXPO_ANDROID_KEY_PASSWORD=your-android-key-password
EXPO_APPLE_ID=your-apple-developer-id
EXPO_APPLE_APP_SPECIFIC_PASSWORD=your-app-specific-password
```

### Code Analysis & Security
```
SONAR_TOKEN=your-sonarcloud-token
SNYK_TOKEN=your-snyk-api-token
OPENAI_API_KEY=your-openai-api-key  # For AI code review
```

### Notifications
```
SLACK_WEBHOOK_URL=your-slack-webhook-url
EMAIL_USERNAME=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
NOTIFICATION_EMAIL=recipient@example.com
```

### Database & Infrastructure
```
REDIS_PASSWORD=your-redis-password
MONGO_USERNAME=your-mongodb-username
MONGO_PASSWORD=your-mongodb-password
GRAFANA_PASSWORD=your-grafana-admin-password
```

## 📋 Secret Setup Instructions

### 1. Docker Hub Setup
1. Create account at [Docker Hub](https://hub.docker.com)
2. Go to Account Settings → Security → New Access Token
3. Copy the token and username to GitHub secrets

### 2. Expo Setup
1. Install Expo CLI: `npm install -g @expo/cli`
2. Login: `expo login`
3. Generate token: `expo whoami` then get token from Expo dashboard
4. Add token to GitHub secrets

### 3. SonarCloud Setup
1. Go to [SonarCloud](https://sonarcloud.io)
2. Import your GitHub repository
3. Generate a token in User → My Account → Security
4. Add token to GitHub secrets

### 4. Slack Integration
1. Create a Slack app in your workspace
2. Add Incoming Webhooks feature
3. Copy webhook URL to GitHub secrets

## 🔧 Environment Variables

Create a `.env.example` file with these variables:
```
NODE_ENV=development
PORT=3000
REDIS_URL=redis://localhost:6379
MONGODB_URL=mongodb://localhost:27017/secureguardian
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key
API_RATE_LIMIT=100
```

## 🚀 Quick Setup Script

Run this script to set up your development environment:

```bash
#!/bin/bash
# setup-secrets.sh

echo "🔐 Setting up SecureGuardian secrets..."

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install it first."
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Set secrets (you'll need to provide the values)
read -p "Enter your Docker Hub username: " DOCKER_USERNAME
read -s -p "Enter your Docker Hub password/token: " DOCKER_PASSWORD
echo

gh secret set DOCKER_USERNAME -b"$DOCKER_USERNAME"
gh secret set DOCKER_PASSWORD -b"$DOCKER_PASSWORD"

echo "✅ Basic secrets configured!"
echo "📝 Please configure the remaining secrets manually in GitHub."
```

## 🔍 Verification

To verify your secrets are working:

1. Push a commit to trigger the workflows
2. Check the Actions tab for any secret-related errors
3. Review workflow logs for authentication issues

## 🛡️ Security Best Practices

- Use tokens with minimal required permissions
- Regularly rotate API tokens and passwords
- Never commit secrets to your repository
- Use environment-specific secrets for different deployment stages
- Monitor secret usage in workflow logs

## 📞 Support

If you encounter issues with secret configuration:
1. Check the workflow logs for specific error messages
2. Verify secret names match exactly (case-sensitive)
3. Ensure tokens have the required permissions
4. Test secrets manually before adding to workflows
