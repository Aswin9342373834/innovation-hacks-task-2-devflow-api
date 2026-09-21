const app = require('../src/app');
const { connectDB } = require('../src/config/db');

module.exports = async (req, res) => {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
    } catch (e) {
      console.error('[Serverless DB Error]', e.message);
    }
  }
  return app(req, res);
};
