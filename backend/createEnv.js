import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `GOOGLE_MAPS_API_KEY=AIzaSyDeL26THVRr605z_TbWT3vhqkj_97AUzTs
MONGODB_URI=mongodb+srv://lakhveers:sS52qVPeLF9hCcyT@cluster0.kihe7bi.mongodb.net/TOUR_DB?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_here
PORT=5002`;

const envPath = path.join(__dirname, '.env');

try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('.env file created successfully at:', envPath);
} catch (error) {
    console.error('Error creating .env file:', error);
} 