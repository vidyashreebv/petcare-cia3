const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { getFirestore } = require('./firestore');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const db = getFirestore();
const petsCollection = db.collection('pets');

// Sample data initialization
async function initializeSampleData() {
  try {
    // Check if data already exists
    const snapshot = await petsCollection.limit(1).get();
    if (!snapshot.empty) {
      console.log('Sample data already exists, skipping initialization');
      return;
    }

    console.log('Initializing sample pet data...');
    const samplePets = [
      {
        name: 'Max',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 30.5,
        gender: 'male',
        ownerName: 'John Smith',
        ownerEmail: 'john.smith@example.com',
        ownerPhone: '+1 (555) 123-4567',
        medicalNotes: 'Allergic to chicken. Regular medication for hip dysplasia.',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        name: 'Luna',
        species: 'cat',
        breed: 'Siamese',
        age: 2,
        weight: 4.2,
        gender: 'female',
        ownerName: 'Sarah Johnson',
        ownerEmail: 'sarah.j@example.com',
        ownerPhone: '+1 (555) 234-5678',
        medicalNotes: 'Indoor cat. Up to date on all vaccinations.',
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        name: 'Charlie',
        species: 'dog',
        breed: 'Beagle',
        age: 5,
        weight: 22.1,
        gender: 'male',
        ownerName: 'Mike Wilson',
        ownerEmail: 'mike.wilson@example.com',
        ownerPhone: '+1 (555) 345-6789',
        medicalNotes: 'Prone to obesity. Requires controlled diet.',
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        name: 'Bella',
        species: 'cat',
        breed: 'Persian',
        age: 4,
        weight: 5.8,
        gender: 'female',
        ownerName: 'Emily Davis',
        ownerEmail: 'emily.davis@example.com',
        ownerPhone: '+1 (555) 456-7890',
        medicalNotes: 'Long-haired breed requiring regular grooming.',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        name: 'Rocky',
        species: 'dog',
        breed: 'German Shepherd',
        age: 6,
        weight: 35.2,
        gender: 'male',
        ownerName: 'David Brown',
        ownerEmail: 'david.brown@example.com',
        ownerPhone: '+1 (555) 567-8901',
        medicalNotes: 'Working dog. Regular joint supplements recommended.',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Whiskers',
        species: 'rabbit',
        breed: 'Holland Lop',
        age: 1,
        weight: 1.8,
        gender: 'female',
        ownerName: 'Lisa Martinez',
        ownerEmail: 'lisa.martinez@example.com',
        ownerPhone: '+1 (555) 678-9012',
        medicalNotes: 'Young rabbit. Requires hay-based diet.',
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const pet of samplePets) {
      await petsCollection.add(pet);
    }

    console.log(`Added ${samplePets.length} sample pets to database`);
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

// Initialize sample data on startup
setTimeout(initializeSampleData, 2000);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pet-service' });
});

// Create Pet
app.post('/pets', async (req, res) => {
  try {
    const { name, species, breed, age, weight, gender, ownerName, ownerEmail, ownerPhone, medicalNotes } = req.body || {};
    if (!name || !species) {
      return res.status(400).json({ error: 'name and species are required' });
    }
    const now = new Date().toISOString();
    const newPet = { 
      name, 
      species, 
      breed: breed || null, 
      age: age || null,
      weight: weight || null,
      gender: gender || null,
      ownerName: ownerName || null, 
      ownerEmail: ownerEmail || null,
      ownerPhone: ownerPhone || null,
      medicalNotes: medicalNotes || null,
      createdAt: now, 
      updatedAt: now 
    };
    const ref = await petsCollection.add(newPet);
    const saved = await ref.get();
    res.status(201).json({ id: ref.id, ...saved.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List Pets
app.get('/pets', async (req, res) => {
  try {
    const { species, q } = req.query;
    let query = petsCollection;
    if (species) {
      query = query.where('species', '==', species);
    }
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (q) {
      const qLower = String(q).toLowerCase();
      items = items.filter(p => String(p.name || '').toLowerCase().includes(qLower));
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pets stats (count by species)
app.get('/pets/stats', async (req, res) => {
  try {
    const snapshot = await petsCollection.get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const counts = {};
    for (const p of items) {
      const key = (p.species || 'unknown').toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    }
    res.json({ total: items.length, bySpecies: counts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Pet by ID
app.get('/pets/:id', async (req, res) => {
  try {
    const doc = await petsCollection.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Pet not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Pet
app.put('/pets/:id', async (req, res) => {
  try {
    const updates = req.body || {};
    updates.updatedAt = new Date().toISOString();
    const ref = petsCollection.doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Pet not found' });
    await ref.update(updates);
    const saved = await ref.get();
    res.json({ id: saved.id, ...saved.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Pet
app.delete('/pets/:id', async (req, res) => {
  try {
    const ref = petsCollection.doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Pet not found' });
    await ref.delete();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`pet-service listening on port ${port}`);
});


