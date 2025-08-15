#!/bin/bash

# CIA3 Cloud Deployment Script
# This script deploys your PetCare microservices to Google Cloud Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ID="petcare-cia3-demo"
CLUSTER_NAME="petcare-cluster"
ZONE="us-central1-a"

echo -e "${GREEN}🚀 Starting CIA3 Cloud Deployment${NC}"

# Step 1: Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found. Please install it first.${NC}"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl not found. Please install it first.${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Step 2: Login and setup project
echo -e "${YELLOW}🔐 Setting up Google Cloud...${NC}"
echo "Please login to Google Cloud when prompted..."
gcloud auth login

# Create project (this might fail if project exists, that's ok)
echo -e "${YELLOW}📝 Creating project ${PROJECT_ID}...${NC}"
gcloud projects create $PROJECT_ID --name="PetCare CIA3" || echo "Project might already exist"

# Set project
gcloud config set project $PROJECT_ID

# Enable APIs
echo -e "${YELLOW}🔧 Enabling required APIs...${NC}"
gcloud services enable container.googleapis.com
gcloud services enable firestore.googleapis.com

# Step 3: Setup Firestore
echo -e "${YELLOW}🗄️ Setting up Firestore database...${NC}"
gcloud firestore databases create --location=us-central1 || echo "Database might already exist"

# Step 4: Create GKE cluster
echo -e "${YELLOW}☁️ Creating GKE cluster...${NC}"
gcloud container clusters create $CLUSTER_NAME \
    --zone=$ZONE \
    --num-nodes=2 \
    --machine-type=e2-small \
    --disk-size=20GB \
    --enable-autoscaling \
    --max-nodes=4 \
    --min-nodes=1 || echo "Cluster might already exist"

# Get credentials
gcloud container clusters get-credentials $CLUSTER_NAME --zone=$ZONE

# Step 5: Configure Docker for GCR
echo -e "${YELLOW}🐳 Configuring Docker...${NC}"
gcloud auth configure-docker

# Step 6: Build and push images
echo -e "${YELLOW}🏗️ Building and pushing Docker images...${NC}"

echo "Building pet-service..."
docker build -t gcr.io/$PROJECT_ID/pet-service:v1.0 ./pet-service
docker push gcr.io/$PROJECT_ID/pet-service:v1.0

echo "Building appointment-service..."
docker build -t gcr.io/$PROJECT_ID/appointment-service:v1.0 ./appointment-service
docker push gcr.io/$PROJECT_ID/appointment-service:v1.0

echo "Building vet-service..."
docker build -t gcr.io/$PROJECT_ID/vet-service:v1.0 ./vet-service
docker push gcr.io/$PROJECT_ID/vet-service:v1.0

echo "Building frontend..."
docker build -t gcr.io/$PROJECT_ID/frontend:v1.0 ./frontend
docker push gcr.io/$PROJECT_ID/frontend:v1.0

# Step 7: Update Kubernetes manifests with project ID
echo -e "${YELLOW}📝 Updating Kubernetes manifests...${NC}"
find k8s/ -name "*.yaml" -exec sed -i '' "s/petcare-cia3-demo/$PROJECT_ID/g" {} \;
find k8s/ -name "*.yaml" -exec sed -i '' "s/:latest/:v1.0/g" {} \;

# Step 8: Deploy to Kubernetes
echo -e "${YELLOW}🚀 Deploying to Kubernetes...${NC}"
kubectl apply -f k8s/

# Step 9: Wait for deployment
echo -e "${YELLOW}⏳ Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/pet-service
kubectl wait --for=condition=available --timeout=300s deployment/appointment-service
kubectl wait --for=condition=available --timeout=300s deployment/vet-service
kubectl wait --for=condition=available --timeout=300s deployment/frontend

# Step 10: Get external IP
echo -e "${YELLOW}🌐 Getting external IP...${NC}"
echo "Waiting for LoadBalancer IP..."
sleep 30

EXTERNAL_IP=$(kubectl get service frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ -z "$EXTERNAL_IP" ]; then
    echo -e "${YELLOW}⏳ LoadBalancer is still provisioning. Run this command to get the IP later:${NC}"
    echo "kubectl get service frontend-service"
else
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${GREEN}🌍 Your application is available at: http://$EXTERNAL_IP${NC}"
fi

# Step 11: Show status
echo -e "${YELLOW}📊 Deployment status:${NC}"
kubectl get pods
kubectl get services

echo -e "${GREEN}✅ CIA3 deployment completed successfully!${NC}"
echo -e "${GREEN}📝 Don't forget to update your CIA3 report with the deployment details.${NC}"
