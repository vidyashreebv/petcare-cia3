const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { getFirestore } = require('./firestore');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const db = getFirestore();
const vets = db.collection('vets');

// Sample data initialization
async function initializeSampleVets() {
  try {
    // Check if vets already exist
    const snapshot = await vets.limit(1).get();
    if (!snapshot.empty) {
      console.log('Sample vet data already exists, skipping initialization');
      return;
    }

    console.log('Initializing sample vet data...');
    const sampleVets = [
      {
        name: 'Sarah Miller',
        specialization: 'general',
        email: 'dr.miller@petcare.com',
        phone: '+1 (555) 111-2222',
        licenseNumber: 'VET001234',
        experience: 8,
        address: '123 Veterinary Blvd, Pet City, PC 12345',
        availability: 'full-time',
        emergencyContact: '+1 (555) 111-9999',
        bio: 'Dr. Miller has been practicing veterinary medicine for over 8 years with a focus on preventive care and wellness programs.',
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        name: 'Michael Chen',
        specialization: 'dentistry',
        email: 'dr.chen@petcare.com',
        phone: '+1 (555) 222-3333',
        licenseNumber: 'VET005678',
        experience: 12,
        address: '456 Animal Ave, Pet City, PC 12345',
        availability: 'full-time',
        emergencyContact: '+1 (555) 222-9999',
        bio: 'Specialist in veterinary dentistry with over 12 years of experience in dental procedures and oral health.',
        createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 8).toISOString()
      },
      {
        name: 'Jennifer Lopez',
        specialization: 'surgery',
        email: 'dr.lopez@petcare.com',
        phone: '+1 (555) 333-4444',
        licenseNumber: 'VET009012',
        experience: 15,
        address: '789 Surgery St, Pet City, PC 12345',
        availability: 'full-time',
        emergencyContact: '+1 (555) 333-9999',
        bio: 'Board-certified veterinary surgeon with 15 years of experience in complex surgical procedures.',
        createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        name: 'Robert Kim',
        specialization: 'emergency',
        email: 'dr.kim@petcare.com',
        phone: '+1 (555) 444-5555',
        licenseNumber: 'VET003456',
        experience: 6,
        address: '321 Emergency Dr, Pet City, PC 12345',
        availability: 'on-call',
        emergencyContact: '+1 (555) 444-9999',
        bio: 'Emergency veterinarian specializing in critical care and urgent medical situations.',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        name: 'Amanda Taylor',
        specialization: 'dermatology',
        email: 'dr.taylor@petcare.com',
        phone: '+1 (555) 555-6666',
        licenseNumber: 'VET007890',
        experience: 10,
        address: '654 Skin Care Lane, Pet City, PC 12345',
        availability: 'part-time',
        emergencyContact: '+1 (555) 555-9999',
        bio: 'Veterinary dermatologist with expertise in skin conditions and allergies in companion animals.',
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        name: 'David Wilson',
        specialization: 'cardiology',
        email: 'dr.wilson@petcare.com',
        phone: '+1 (555) 666-7777',
        licenseNumber: 'VET001122',
        experience: 20,
        address: '987 Heart Health Way, Pet City, PC 12345',
        availability: 'full-time',
        emergencyContact: '+1 (555) 666-9999',
        bio: 'Senior veterinary cardiologist with 20 years of experience in diagnosing and treating heart conditions.',
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const vet of sampleVets) {
      await vets.add(vet);
    }

    console.log(`Added ${sampleVets.length} sample vets to database`);
  } catch (error) {
    console.error('Error initializing sample vet data:', error);
  }
}

// Initialize sample data on startup
setTimeout(initializeSampleVets, 3000);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'vet-service' });
});

// Create vet
app.post('/vets', async (req, res) => {
  try {
    const { name, specialization, phone, email, licenseNumber, experience, address, availability, emergencyContact, bio } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });
    const now = new Date().toISOString();
    const vet = { 
      name, 
      specialization: specialization || null, 
      phone: phone || null, 
      email: email || null,
      licenseNumber: licenseNumber || null,
      experience: experience || null,
      address: address || null,
      availability: availability || 'full-time',
      emergencyContact: emergencyContact || null,
      bio: bio || null,
      createdAt: now, 
      updatedAt: now 
    };
    const ref = await vets.add(vet);
    const saved = await ref.get();
    res.status(201).json({ id: ref.id, ...saved.data() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List vets
app.get('/vets', async (req, res) => {
  try {
    const snapshot = await vets.orderBy('createdAt', 'desc').get();
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get vet by id
app.get('/vets/:id', async (req, res) => {
  try {
    const doc = await vets.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Vet not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update vet
app.put('/vets/:id', async (req, res) => {
  try {
    const updates = req.body || {};
    updates.updatedAt = new Date().toISOString();
    const ref = vets.doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Vet not found' });
    await ref.update(updates);
    const saved = await ref.get();
    res.json({ id: saved.id, ...saved.data() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete vet
app.delete('/vets/:id', async (req, res) => {
  try {
    const ref = vets.doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Vet not found' });
    await ref.delete();
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`vet-service listening on port ${port}`);
});


