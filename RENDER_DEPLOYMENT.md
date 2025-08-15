# Render Deployment for CIA3 PetCare Microservices

## Prerequisites

1. Create a free account at https://render.com
2. Connect your GitHub repository to Render

## Deployment Steps

### Step 1: Push to GitHub

```bash
# If not already done, initialize git and push to GitHub
git init
git add .
git commit -m "CIA3 PetCare Microservices"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/petcare-cia3.git
git push -u origin main
```

### Step 2: Deploy Services on Render

#### 1. Frontend Service

- Service Type: Web Service
- Environment: Docker
- Build Command: (leave empty)
- Start Command: (leave empty)
- Dockerfile: `./frontend/Dockerfile`
- Port: 80

#### 2. Pet Service

- Service Type: Web Service
- Environment: Docker
- Build Command: (leave empty)
- Start Command: (leave empty)
- Dockerfile: `./pet-service/Dockerfile`
- Port: 3000

#### 3. Appointment Service

- Service Type: Web Service
- Environment: Docker
- Build Command: (leave empty)
- Start Command: (leave empty)
- Dockerfile: `./appointment-service/Dockerfile`
- Port: 3000

#### 4. Vet Service

- Service Type: Web Service
- Environment: Docker
- Build Command: (leave empty)
- Start Command: (leave empty)
- Dockerfile: `./vet-service/Dockerfile`
- Port: 3000

### Step 3: Configure Environment Variables

For each backend service, add these environment variables:

- `PORT`: 3000
- `NODE_ENV`: production

### Step 4: Update Frontend API URLs

Once backend services are deployed, update the frontend to use the Render URLs instead of localhost.

## Expected URLs

After deployment, you'll get URLs like:

- Frontend: `https://petcare-frontend-abc123.onrender.com`
- Pet Service: `https://petcare-pet-service-abc123.onrender.com`
- Appointment Service: `https://petcare-appointment-service-abc123.onrender.com`
- Vet Service: `https://petcare-vet-service-abc123.onrender.com`

## Notes

- Free tier may have cold starts (30-second delay if inactive)
- Perfect for student assignments and demonstrations
- All services get HTTPS automatically
