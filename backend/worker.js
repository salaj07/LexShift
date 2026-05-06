require('dotenv').config(); 

const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Worker DB connected'))
  .catch(console.error);

// start worker
require('./src/services/aiWorker.service');

console.log('🚀 Worker started...');