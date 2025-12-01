const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('../src/database/models/Room');
const roomsData = require('../src/database/seedData/rooms');

dotenv.config();

const seedRooms = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    // Clear existing rooms
    console.log('Clearing existing rooms...');
    await Room.deleteMany({});
    console.log('✓ Cleared existing rooms');

    // Insert new rooms
    console.log('Seeding rooms data...');
    const inserted = await Room.insertMany(roomsData);
    console.log(`✓ Successfully seeded ${inserted.length} rooms`);

    // Display summary
    const buildings = await Room.distinct('gedung');
    console.log('\n--- Room Summary ---');
    console.log(`Total rooms: ${inserted.length}`);
    console.log(`Buildings: ${buildings.join(', ')}`);

    for (const building of buildings) {
      const count = await Room.countDocuments({ gedung: building });
      console.log(`  ${building}: ${count} rooms`);
    }

    await mongoose.connection.close();
    console.log('\n✓ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedRooms();
