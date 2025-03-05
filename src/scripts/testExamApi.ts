import axios from 'axios';
import logger from '../utils/logger';

const testApi = async () => {
  try {
    logger.info('Testing /api/exams endpoint...');
    const response1 = await axios.get('http://localhost:3001/api/exams');
    logger.info('Response:', response1.data);
    
    logger.info('\nTesting /api/exams/public endpoint...');
    const response2 = await axios.get('http://localhost:3001/api/exams/public');
    logger.info('Response:', response2.data);
  } catch (error) {
    logger.error('API test failed:', error instanceof Error ? error.message : String(error));
    if (error && typeof error === 'object' && 'response' in error) {
      logger.error('Status:', error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response ? error.response.status : 'unknown');
      logger.error('Data:', error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response ? error.response.data : 'unknown');
    }
  }
};

testApi(); 