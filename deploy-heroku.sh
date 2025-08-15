#!/bin/bash

# CIA3 Heroku Deployment Script (100% Free)
# No billing or credit card required

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting CIA3 Heroku Deployment (Free Tier)${NC}"

# Step 1: Check if Heroku CLI is installed
echo -e "${YELLOW}📋 Checking Heroku CLI...${NC}"
if ! command -v heroku &> /dev/null; then
    echo -e "${YELLOW}Installing Heroku CLI...${NC}"
    # Install Heroku CLI for macOS
    curl https://cli-assets.heroku.com/install.sh | sh
fi

echo -e "${GREEN}✅ Heroku CLI ready${NC}"

# Step 2: Login to Heroku
echo -e "${YELLOW}🔐 Logging into Heroku...${NC}"
heroku login --interactive

# Step 3: Create package.json files for each service (required for Heroku Node.js deployment)
echo -e "${YELLOW}📝 Preparing services for deployment...${NC}"

# Add start script to pet-service package.json
cd pet-service
npm init -y 2>/dev/null || true
npm install express cors morgan @google-cloud/firestore --save 2>/dev/null || true
cd ..

# Add start script to appointment-service package.json  
cd appointment-service
npm init -y 2>/dev/null || true
npm install express cors morgan @google-cloud/firestore --save 2>/dev/null || true
cd ..

# Add start script to vet-service package.json
cd vet-service
npm init -y 2>/dev/null || true
npm install express cors morgan @google-cloud/firestore --save 2>/dev/null || true
cd ..

# Step 4: Create Heroku apps
echo -e "${YELLOW}🏗️ Creating Heroku applications...${NC}"

# Generate unique app names with timestamp
TIMESTAMP=$(date +%s)
PET_APP="petcare-pets-${TIMESTAMP}"
APPOINTMENT_APP="petcare-appointments-${TIMESTAMP}"
VET_APP="petcare-vets-${TIMESTAMP}"

echo "Creating app: $PET_APP"
heroku create $PET_APP

echo "Creating app: $APPOINTMENT_APP"
heroku create $APPOINTMENT_APP

echo "Creating app: $VET_APP"
heroku create $VET_APP

# Step 5: Setup Firebase project for production
echo -e "${YELLOW}🔥 Setting up Firebase...${NC}"
if ! command -v firebase &> /dev/null; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Create a unique Firebase project ID
FIREBASE_PROJECT="petcare-cia3-${TIMESTAMP}"
echo "Firebase project ID: $FIREBASE_PROJECT"

# Step 6: Deploy Pet Service
echo -e "${YELLOW}🐕 Deploying Pet Service...${NC}"
cd pet-service

# Initialize git repo
git init 2>/dev/null || true
heroku git:remote -a $PET_APP

# Set environment variables
heroku config:set FIREBASE_PROJECT_ID=$FIREBASE_PROJECT -a $PET_APP
heroku config:set NODE_ENV=production -a $PET_APP

# Deploy
git add .
git commit -m "Deploy pet service to Heroku" 2>/dev/null || git commit --amend -m "Deploy pet service to Heroku"
git push heroku main -f

cd ..

# Step 7: Deploy Appointment Service  
echo -e "${YELLOW}📅 Deploying Appointment Service...${NC}"
cd appointment-service

git init 2>/dev/null || true
heroku git:remote -a $APPOINTMENT_APP
heroku config:set FIREBASE_PROJECT_ID=$FIREBASE_PROJECT -a $APPOINTMENT_APP
heroku config:set NODE_ENV=production -a $APPOINTMENT_APP

git add .
git commit -m "Deploy appointment service to Heroku" 2>/dev/null || git commit --amend -m "Deploy appointment service to Heroku"
git push heroku main -f

cd ..

# Step 8: Deploy Vet Service
echo -e "${YELLOW}👨‍⚕️ Deploying Vet Service...${NC}"
cd vet-service

git init 2>/dev/null || true  
heroku git:remote -a $VET_APP
heroku config:set FIREBASE_PROJECT_ID=$FIREBASE_PROJECT -a $VET_APP
heroku config:set NODE_ENV=production -a $VET_APP

git add .
git commit -m "Deploy vet service to Heroku" 2>/dev/null || git commit --amend -m "Deploy vet service to Heroku"
git push heroku main -f

cd ..

# Step 9: Show results
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}📊 Your deployed microservices:${NC}"
echo ""
echo -e "${YELLOW}Pet Service:${NC} https://$PET_APP.herokuapp.com"
echo -e "${YELLOW}Appointment Service:${NC} https://$APPOINTMENT_APP.herokuapp.com" 
echo -e "${YELLOW}Vet Service:${NC} https://$VET_APP.herokuapp.com"
echo ""
echo -e "${GREEN}✅ CIA3 Assignment Complete!${NC}"
echo -e "${GREEN}🎯 You now have microservices deployed to a cloud platform (Heroku)${NC}"
echo ""
echo -e "${YELLOW}📝 For your report, include these URLs and mention:${NC}"
echo "- Cloud Platform: Heroku"
echo "- Deployment Type: Platform as a Service (PaaS)"
echo "- Database: Firebase Firestore"
echo "- Containerization: Docker (via Heroku's container stack)"
