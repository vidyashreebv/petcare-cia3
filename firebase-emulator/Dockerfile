FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openjdk17-jre-headless bash curl

RUN npm i -g firebase-tools@12.9.1

COPY firebase /app/firebase

ENV FIREBASE_PROJECT_ID=demo-petcare

EXPOSE 8080 4000

VOLUME ["/app/data"]

CMD ["sh", "-c", "firebase emulators:start --only firestore --project $FIREBASE_PROJECT_ID --import ./data --export-on-exit --config /app/firebase/firebase.json"]


