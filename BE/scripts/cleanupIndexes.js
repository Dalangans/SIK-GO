const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const cleanup = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected');

    console.log('Dropping indexes on rooms collection...');
    await mongoose.connection.collection('rooms').dropIndexes();
    console.log('✓ Indexes dropped');

    await mongoose.connection.close();
    console.log('✓ Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

cleanup();
