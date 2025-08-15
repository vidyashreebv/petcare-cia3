# 🚀 AWS Deployment Guide for CIA3 (Free Tier)

## Why AWS is Perfect for Your Assignment:

- ✅ **Specifically mentioned** in the assignment requirements
- ✅ **12 months free tier** for new accounts
- ✅ **ECS Free Tier**: 750 hours/month of t2.micro instances
- ✅ **ECR**: 500MB storage free
- ✅ **Perfect for microservices**

## AWS Free Tier Limits (Perfect for CIA3):

- EC2: 750 hours/month of t2.micro instances
- ECS: No additional charges for ECS itself
- ECR: 500MB of storage for container images
- RDS: 750 hours/month of db.t2.micro
- More than enough for academic projects!

## Quick AWS Deployment Steps:

### 1. Install AWS CLI

```bash
# For macOS
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Verify installation
aws --version
```

### 2. Create AWS Account & Setup

1. Go to https://aws.amazon.com/
2. Create free account (12 months free tier)
3. Get your Access Key ID and Secret Access Key from IAM console

### 3. Configure AWS CLI

```bash
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output format: json
```

### 4. Run Deployment Script

```bash
./deploy-aws.sh
```

## What You'll Get:

- **ECS Cluster** running your 3 microservices
- **Application Load Balancer** for external access
- **ECR repositories** for your Docker images
- **RDS PostgreSQL** database (free tier)
- **Public URLs** for all your services

## Benefits over GCP:

- 🆓 **True free tier** (12 months)
- 💳 **No billing setup required** for free tier
- 📚 **Great for learning**
- 🎯 **Assignment requirement** (specifically mentioned)
- 🔧 **Industry standard** (most companies use AWS)
