const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { getFirestore } = require('./firestore');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const db = getFirestore();
const appointments = db.collection('appointments');
const pets = db.collection('pets');

// Sample data initialization
async function initializeSampleAppointments() {
  try {
    // Check if appointments already exist
    const snapshot = await appointments.limit(1).get();
    if (!snapshot.empty) {
      console.log('Sample appointment data already exists, skipping initialization');
      return;
    }

    console.log('Initializing sample appointment data...');
    
    // First, get some pet IDs (we'll wait a bit for pets to be created)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const petsSnapshot = await pets.limit(6).get();
    const petIds = petsSnapshot.docs.map(doc => doc.id);
    
    if (petIds.length === 0) {
      console.log('No pets found, skipping appointment initialization');
      return;
    }

    const sampleAppointments = [
      {
        petId: petIds[0] || 'temp-pet-1',
        vetName: 'Dr. Sarah Miller',
        reason: 'Annual checkup and vaccinations',
        scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        status: 'scheduled',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        petId: petIds[1] || 'temp-pet-2',
        vetName: 'Dr. Michael Chen',
        reason: 'Dental cleaning',
        scheduledAt: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        status: 'confirmed',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        petId: petIds[2] || 'temp-pet-3',
        vetName: 'Dr. Jennifer Lopez',
        reason: 'Follow-up examination',
        scheduledAt: new Date(Date.now() - 86400000 * 1).toISOString(), // Yesterday
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        petId: petIds[3] || 'temp-pet-4',
        vetName: 'Dr. Robert Kim',
        reason: 'Emergency visit - stomach upset',
        scheduledAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        petId: petIds[4] || 'temp-pet-5',
        vetName: 'Dr. Amanda Taylor',
        reason: 'Spay surgery consultation',
        scheduledAt: new Date(Date.now() + 86400000 * 7).toISOString(), // 1 week from now
        status: 'scheduled',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        petId: petIds[5] || 'temp-pet-6',
        vetName: 'Dr. David Wilson',
        reason: 'Routine wellness exam',
        scheduledAt: new Date().toISOString(), // Today
        status: 'in-progress',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const appointment of sampleAppointments) {
      await appointments.add(appointment);
    }

    console.log(`Added ${sampleAppointments.length} sample appointments to database`);
  } catch (error) {
    console.error('Error initializing sample appointment data:', error);
  }
}

// Initialize sample data on startup
setTimeout(initializeSampleAppointments, 4000);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'appointment-service' });
});

// Create Appointment
app.post('/appointments', async (req, res) => {
  try {
    const { 
      owner, 
      phone, 
      petName, 
      petType, 
      service, 
      date, 
      time, 
      vet,
      // Legacy support
      petId, 
      vetName, 
      reason, 
      scheduledAt, 
      status 
    } = req.body || {};

    // Handle new frontend format
    if (owner && petName && service && date && time) {
      const now = new Date().toISOString();
      const newAppt = {
        owner,
        phone: phone || '',
        petName,
        petType: petType || '',
        service,
        date,
        time,
        vet: vet || 'Any Available Vet',
        status: status || 'pending',
        createdAt: now,
        updatedAt: now
      };
      const ref = await appointments.add(newAppt);
      const saved = await ref.get();
      return res.status(201).json({ id: ref.id, ...saved.data() });
    }

    // Legacy format support
    if (!petId || !vetName || !scheduledAt) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    const petDoc = await pets.doc(petId).get();
    if (!petDoc.exists) {
      return res.status(400).json({ error: 'Invalid petId: pet not found' });
    }
    const now = new Date().toISOString();
    const newAppt = {
      petId,
      vetName,
      reason: reason || null,
      scheduledAt,
      status: status || 'scheduled',
      createdAt: now,
      updatedAt: now
    };
    const ref = await appointments.add(newAppt);
    const saved = await ref.get();
    res.status(201).json({ id: ref.id, ...saved.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List Appointments with optional filtering by status or petId
app.get('/appointments', async (req, res) => {
  try {
    const { status, petId } = req.query;
    let query = appointments;
    if (status) query = query.where('status', '==', status);
    if (petId) query = query.where('petId', '==', petId);
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Appointment by ID
app.get('/appointments/:id', async (req, res) => {
  try {
    const doc = await appointments.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Appointment
app.put('/appointments/:id', async (req, res) => {
  try {
    const updates = req.body || {};
    updates.updatedAt = new Date().toISOString();
    const ref = appointments.doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Appointment not found' });
    if (updates.petId) {
      const petDoc = await pets.doc(updates.petId).get();
      if (!petDoc.exists) return res.status(400).json({ error: 'Invalid petId: pet not found' });
    }
    await ref.update(updates);
    const saved = await ref.get();
    res.json({ id: saved.id, ...saved.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update only status
app.patch('/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ error: 'status is required' });
    const ref = appointments.doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Appointment not found' });
    await ref.update({ status, updatedAt: new Date().toISOString() });
    const saved = await ref.get();
    res.json({ id: saved.id, ...saved.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Appointment
app.delete('/appointments/:id', async (req, res) => {
  try {
    const ref = appointments.doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Appointment not found' });
    await ref.delete();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`appointment-service listening on port ${port}`);
});

// Stats: count by status
app.get('/appointments/stats', async (req, res) => {
  try {
    const snapshot = await appointments.get();
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    const counts = {};
    for (const a of items) {
      const key = (a.status || 'scheduled').toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    }
    res.json({ total: items.length, byStatus: counts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


