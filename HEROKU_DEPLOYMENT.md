# Alternative: Quick Heroku Deployment

If you prefer a simpler deployment option, you can use Heroku:

## Prerequisites

1. Heroku account (free tier available)
2. Heroku CLI installed

## Quick Deployment Steps

### 1. Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### 2. Login to Heroku

```bash
heroku login
```

### 3. Create Heroku apps for each service

```bash
# Create apps
heroku create petcare-pet-service
heroku create petcare-appointment-service
heroku create petcare-vet-service
heroku create petcare-frontend

# Add buildpacks
heroku buildpacks:set heroku/nodejs -a petcare-pet-service
heroku buildpacks:set heroku/nodejs -a petcare-appointment-service
heroku buildpacks:set heroku/nodejs -a petcare-vet-service
heroku buildpacks:set heroku/nodejs -a petcare-frontend
```

### 4. Setup Firebase for production

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create Firebase project
firebase projects:create petcare-cia3-prod

# Initialize Firestore
firebase firestore:databases:create --project petcare-cia3-prod
```

### 5. Deploy each service

```bash
# Pet Service
cd pet-service
git init
heroku git:remote -a petcare-pet-service
heroku config:set FIREBASE_PROJECT_ID=petcare-cia3-prod
git add .
git commit -m "Deploy pet service"
git push heroku main

# Appointment Service
cd ../appointment-service
git init
heroku git:remote -a petcare-appointment-service
heroku config:set FIREBASE_PROJECT_ID=petcare-cia3-prod
git add .
git commit -m "Deploy appointment service"
git push heroku main

# Vet Service
cd ../vet-service
git init
heroku git:remote -a petcare-vet-service
heroku config:set FIREBASE_PROJECT_ID=petcare-cia3-prod
git add .
git commit -m "Deploy vet service"
git push heroku main
```

## Your deployed URLs will be:

- Pet Service: https://petcare-pet-service.herokuapp.com
- Appointment Service: https://petcare-appointment-service.herokuapp.com
- Vet Service: https://petcare-vet-service.herokuapp.com
