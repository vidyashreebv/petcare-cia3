# Cloud Deployment Guide for CIA3

## Prerequisites

1. Google Cloud account with billing enabled
2. gcloud CLI installed
3. kubectl installed

## Step 1: Setup GCP Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create petcare-cia3-demo --name="PetCare CIA3"

# Set the project as default
gcloud config set project petcare-cia3-demo

# Enable required APIs
gcloud services enable container.googleapis.com
gcloud services enable firestore.googleapis.com
```

## Step 2: Setup Firestore Database

```bash
# Create Firestore database
gcloud firestore databases create --location=us-central1
```

## Step 3: Create GKE Cluster

```bash
# Create a small cluster
gcloud container clusters create petcare-cluster \
    --zone=us-central1-a \
    --num-nodes=2 \
    --machine-type=e2-micro \
    --disk-size=10GB

# Get credentials for kubectl
gcloud container clusters get-credentials petcare-cluster --zone=us-central1-a
```

## Step 4: Build and Push Docker Images

```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Build and push images
docker build -t gcr.io/petcare-cia3-demo/pet-service:latest ./pet-service
docker push gcr.io/petcare-cia3-demo/pet-service:latest

docker build -t gcr.io/petcare-cia3-demo/appointment-service:latest ./appointment-service
docker push gcr.io/petcare-cia3-demo/appointment-service:latest

docker build -t gcr.io/petcare-cia3-demo/vet-service:latest ./vet-service
docker push gcr.io/petcare-cia3-demo/vet-service:latest

docker build -t gcr.io/petcare-cia3-demo/frontend:latest ./frontend
docker push gcr.io/petcare-cia3-demo/frontend:latest
```

## Step 5: Deploy to Kubernetes

```bash
# Apply the manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

## Step 6: Access Your Application

```bash
# Get external IP
kubectl get service frontend-service
```
