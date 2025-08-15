const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell } = require('docx');

async function generate() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({ text: 'CIA3 – Pet Care and Veterinary System', heading: HeadingLevel.TITLE }),
          new Paragraph(''),
          new Paragraph({ text: 'Microservice Architecture', heading: HeadingLevel.HEADING_1 }),
          new Paragraph('This project implements two RESTful microservices using Node.js/Express and Firebase Firestore.'),
          new Paragraph(''),
          new Paragraph({ text: 'Services', heading: HeadingLevel.HEADING_2 }),
          new Paragraph('- Pet Service: CRUD for pets (name, species, breed, age, owner information).'),
          new Paragraph('- Appointment Service: CRUD for vet appointments, referencing pets.'),
          new Paragraph(''),
          new Paragraph({ text: 'Data Store', heading: HeadingLevel.HEADING_2 }),
          new Paragraph('Firebase Firestore is used for persistence. Local development uses the Firestore Emulator; production can use real Firestore with appropriate credentials.'),
          new Paragraph(''),
          new Paragraph({ text: 'Containerization', heading: HeadingLevel.HEADING_1 }),
          new Paragraph('Each microservice has its own Dockerfile. docker-compose orchestrates the services and the Firestore Emulator.'),
          new Paragraph(''),
          new Paragraph({ text: 'Endpoints', heading: HeadingLevel.HEADING_2 }),
          new Paragraph('Pet Service (http://localhost:3001):'),
          new Paragraph('  - POST /pets'),
          new Paragraph('  - GET /pets'),
          new Paragraph('  - GET /pets/:id'),
          new Paragraph('  - PUT /pets/:id'),
          new Paragraph('  - DELETE /pets/:id'),
          new Paragraph('Appointment Service (http://localhost:3002):'),
          new Paragraph('  - POST /appointments'),
          new Paragraph('  - GET /appointments'),
          new Paragraph('  - GET /appointments/:id'),
          new Paragraph('  - PUT /appointments/:id'),
          new Paragraph('  - DELETE /appointments/:id'),
          new Paragraph(''),
          new Paragraph({ text: 'Kubernetes', heading: HeadingLevel.HEADING_1 }),
          new Paragraph('Example manifests are provided under k8s/. Configure Firestore credentials or use cloud identity in your cluster.'),
          new Paragraph(''),
          new Paragraph({ text: 'How to Run', heading: HeadingLevel.HEADING_1 }),
          new Paragraph('1) docker compose up --build'),
          new Paragraph('2) Access services at http://localhost:3001 and http://localhost:3002'),
          new Paragraph('3) View Emulator UI at http://localhost:4000'),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outDir = path.resolve(__dirname, '..', 'docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'CIA3_Report.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated: ${outPath}`);
}

generate().catch((e) => {
  console.error(e);
  process.exit(1);
});


