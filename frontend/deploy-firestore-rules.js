// deploy-firestore-rules.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Deploying Firestore rules...');

// Path to the Firestore rules file
const rulesPath = path.join(__dirname, 'src', 'ModelWork', 'firestore.rules');
console.log('Using Firestore rules from:', rulesPath);

// Check if the rules file exists
if (!fs.existsSync(rulesPath)) {
  console.error('Firestore rules file not found at:', rulesPath);
  process.exit(1);
}

// Create a temporary firestore.rules file in the project root
const tempRulesPath = path.join(__dirname, 'firestore.rules');
fs.copyFileSync(rulesPath, tempRulesPath);

try {
  // Deploy the rules using Firebase CLI
  console.log('Running Firebase deploy command for Firestore rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  console.log('Firestore rules deployed successfully!');
} catch (error) {
  console.error('Error deploying Firestore rules:', error.message);
  process.exit(1);
} finally {
  // Clean up the temporary file
  if (fs.existsSync(tempRulesPath)) {
    fs.unlinkSync(tempRulesPath);
  }
}
