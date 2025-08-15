#!/bin/bash

# CIA3 AWS Deployment Script
# This script deploys your PetCare microservices to AWS using ECS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="us-east-1"
CLUSTER_NAME="petcare-cia3-cluster"
ECR_REGISTRY=""

echo -e "${GREEN}🚀 Starting CIA3 AWS Deployment${NC}"

# Step 1: Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Step 2: Configure AWS CLI
echo -e "${YELLOW}🔐 Configuring AWS CLI...${NC}"
echo "Please follow the prompts to configure AWS CLI with your credentials:"
aws configure

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo -e "${GREEN}✅ AWS Account ID: ${ACCOUNT_ID}${NC}"

# Step 3: Create ECR repositories
echo -e "${YELLOW}🐳 Creating ECR repositories...${NC}"

aws ecr create-repository --repository-name petcare/frontend --region $AWS_REGION || echo "Repository might already exist"
aws ecr create-repository --repository-name petcare/pet-service --region $AWS_REGION || echo "Repository might already exist"
aws ecr create-repository --repository-name petcare/appointment-service --region $AWS_REGION || echo "Repository might already exist"
aws ecr create-repository --repository-name petcare/vet-service --region $AWS_REGION || echo "Repository might already exist"

# Step 4: Login to ECR
echo -e "${YELLOW}🔑 Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Step 5: Build and push images
echo -e "${YELLOW}🏗️ Building and pushing Docker images...${NC}"

echo "Building and pushing frontend..."
docker build -t petcare/frontend ./frontend
docker tag petcare/frontend:latest $ECR_REGISTRY/petcare/frontend:latest
docker push $ECR_REGISTRY/petcare/frontend:latest

echo "Building and pushing pet-service..."
docker build -t petcare/pet-service ./pet-service
docker tag petcare/pet-service:latest $ECR_REGISTRY/petcare/pet-service:latest
docker push $ECR_REGISTRY/petcare/pet-service:latest

echo "Building and pushing appointment-service..."
docker build -t petcare/appointment-service ./appointment-service
docker tag petcare/appointment-service:latest $ECR_REGISTRY/petcare/appointment-service:latest
docker push $ECR_REGISTRY/petcare/appointment-service:latest

echo "Building and pushing vet-service..."
docker build -t petcare/vet-service ./vet-service
docker tag petcare/vet-service:latest $ECR_REGISTRY/petcare/vet-service:latest
docker push $ECR_REGISTRY/petcare/vet-service:latest

# Step 6: Create ECS Cluster
echo -e "${YELLOW}☁️ Creating ECS cluster...${NC}"
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION || echo "Cluster might already exist"

# Step 7: Create Application Load Balancer
echo -e "${YELLOW}🔄 Setting up Load Balancer...${NC}"

# Get default VPC and subnets
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text --region $AWS_REGION)
SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[*].SubnetId" --output text --region $AWS_REGION)

# Create security group for ALB
ALB_SG_ID=$(aws ec2 create-security-group \
    --group-name petcare-alb-sg \
    --description "Security group for PetCare ALB" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query "GroupId" --output text 2>/dev/null || \
    aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=petcare-alb-sg" \
    --query "SecurityGroups[0].GroupId" --output text --region $AWS_REGION)

# Allow HTTP traffic
aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION 2>/dev/null || echo "Security group rule might already exist"

# Create ALB
ALB_ARN=$(aws elbv2 create-load-balancer \
    --name petcare-alb \
    --subnets $SUBNET_IDS \
    --security-groups $ALB_SG_ID \
    --region $AWS_REGION \
    --query "LoadBalancers[0].LoadBalancerArn" --output text 2>/dev/null || \
    aws elbv2 describe-load-balancers \
    --names petcare-alb \
    --query "LoadBalancers[0].LoadBalancerArn" --output text --region $AWS_REGION)

echo -e "${GREEN}✅ Load Balancer created: $ALB_ARN${NC}"

# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
    --load-balancer-arns $ALB_ARN \
    --query "LoadBalancers[0].DNSName" --output text --region $AWS_REGION)

echo -e "${GREEN}🌍 Your application will be available at: http://$ALB_DNS${NC}"

# Step 8: Create Target Groups
echo -e "${YELLOW}🎯 Creating target groups...${NC}"

# Frontend target group
FRONTEND_TG_ARN=$(aws elbv2 create-target-group \
    --name petcare-frontend-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id $VPC_ID \
    --target-type ip \
    --health-check-path "/" \
    --region $AWS_REGION \
    --query "TargetGroups[0].TargetGroupArn" --output text 2>/dev/null || \
    aws elbv2 describe-target-groups \
    --names petcare-frontend-tg \
    --query "TargetGroups[0].TargetGroupArn" --output text --region $AWS_REGION)

# Create listener
aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=$FRONTEND_TG_ARN \
    --region $AWS_REGION 2>/dev/null || echo "Listener might already exist"

echo -e "${GREEN}✅ Infrastructure setup completed!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Create ECS task definitions"
echo "2. Create ECS services"
echo "3. Deploy your applications"
echo ""
echo -e "${GREEN}🌍 Your application URL: http://$ALB_DNS${NC}"
echo -e "${GREEN}📝 Update your CIA3 report with this deployment URL${NC}"
