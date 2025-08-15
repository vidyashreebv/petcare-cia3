## Pet Care and Veterinary System – Microservices (Firebase + Node.js)

This project contains two microservices built with Node.js/Express using Firebase Firestore for data storage. It includes Docker containerization, a Firebase Firestore emulator for local development, and Kubernetes manifests for deployment.

### Microservices

- Pet Service (CRUD for pets)
- Appointment Service (CRUD for appointments referencing pets)

### Tech Stack

- Node.js + Express
- Firebase Firestore (via `@google-cloud/firestore` client)
- Docker + Docker Compose (with Firestore Emulator)
- Kubernetes manifests (for cluster deployment)

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (only needed if running services locally outside Docker or generating the Word document)

---

## Run Locally with Docker (uses Firestore Emulator)

1. Build and start containers:

```
docker compose up --build
```

2. Services:

- Pet Service: http://localhost:3001
- Appointment Service: http://localhost:3002
- Firestore Emulator UI: http://localhost:4000

3. Example endpoints:

- POST http://localhost:3001/pets
- GET http://localhost:3001/pets
- GET http://localhost:3001/pets/:id
- PUT http://localhost:3001/pets/:id
- DELETE http://localhost:3001/pets/:id

- POST http://localhost:3002/appointments
- GET http://localhost:3002/appointments
- GET http://localhost:3002/appointments/:id
- PUT http://localhost:3002/appointments/:id
- DELETE http://localhost:3002/appointments/:id

Body examples are in the service source files.

---

## Kubernetes Deployment (example)

These manifests deploy the microservices. By default they target real Firestore (no emulator). To use real Firestore, provide Google credentials (service account) to the pods using one of the following:

- Mount a Kubernetes Secret containing a service account JSON and set `GOOGLE_APPLICATION_CREDENTIALS` to that path, and set `FIREBASE_PROJECT_ID` accordingly; or
- Use cloud-native identity (e.g., GKE Workload Identity).

Apply manifests:

```
kubectl apply -f k8s/pet-service.yaml
kubectl apply -f k8s/appointment-service.yaml
```

Note: If you prefer to use the emulator in a cluster, deploy a Firestore emulator pod/service and set `FIRESTORE_EMULATOR_HOST` env var on the microservices to point to it.

---

## Generate Word Document (required submission)

This repository includes a script that generates a `.docx` report summarizing the system.

1. Install dependencies for the generator:

```
cd /Users/swathishreebv/Documents/4thTrimester/MS/CIA3
npm install
```

2. Generate the Word document:

```
npm run generate-doc
```

The report will be created at `docs/CIA3_Report.docx`.

---

## Project Structure

```
CIA3/
  appointment-service/
    Dockerfile
    package.json
    src/
      firestore.js
      index.js
  pet-service/
    Dockerfile
    package.json
    src/
      firestore.js
      index.js
  firebase/
    firebase.json
    firestore.rules
  firebase-emulator/
    Dockerfile
  k8s/
    appointment-service.yaml
    pet-service.yaml
  scripts/
    generate-doc.js
  docs/
    (generated) CIA3_Report.docx
  docker-compose.yml
  README.md
  package.json (for doc generation only)
```

---

## Notes

- Local development uses the Firestore emulator; no Google credentials required.
- For production/cluster, configure credentials or identity.
- Ports can be changed via `docker-compose.yml`.
