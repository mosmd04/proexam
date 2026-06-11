import { execSync } from 'child_process';
import { setTimeout } from 'timers/promises';

console.log('🚀 Starting Database Provisioning for ProExam...\n');

try {
  // 1. Start Docker Container
  console.log('📦 Starting PostgreSQL Docker container...');
  try {
    execSync('docker compose up -d', { stdio: 'inherit' });
  } catch (e) {
    // Fallback for older docker-compose installations
    console.log('Falling back to docker-compose command...');
    execSync('docker-compose up -d', { stdio: 'inherit' });
  }

  // 2. Wait for Initialization
  console.log('\n⏳ Waiting 10 seconds for PostgreSQL to fully initialize and accept connections...');
  await setTimeout(10000);

  // 3. Push Prisma Schema
  console.log('\n🛠️ Pushing Prisma schema to the database...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  // 4. Run Seed Script
  console.log('\n🌱 Executing Database Seed Script...');
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });

  console.log('\n✅ Database Provisioning & Seeding Complete! The system is ready.');
} catch (error) {
  console.error('\n❌ Error during provisioning:', error.message);
  process.exit(1);
}
