import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Account } from '../database/schemas/account.schema';
import { Role, Status } from '../database/schemas/account.schema';

async function seedSuperadmin() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const accountModel = app.get<Model<Account>>(getModelToken(Account.name));

    const email = process.env.SEED_SUPERADMIN_EMAIL || 'vip.mstudio@gmail.com';
    const password = process.env.SEED_SUPERADMIN_PASSWORD || '123456';

    // Check if superadmin already exists
    const existingSuperadmin = await accountModel.findOne({ email });

    if (existingSuperadmin) {
      console.log('✅ Superadmin already exists:', email);
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create superadmin with 16-digit account number
    const superadmin = new accountModel({
      name: 'Le Huy Dev',
      email,
      passwordHash,
      accountNumber: '9999999999999999', // 16-digit superadmin account
      nickname: 'lehuydev',
      role: Role.SUPERADMIN,
      status: Status.ACTIVE,
      isEmailVerified: true,
      verifiedAt: new Date(),
    });

    await superadmin.save();

    console.log('✅ Superadmin created successfully:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Account Number:', '9999999999999999');
    console.log('   Nickname:', 'lehuydev');
    console.log('   Role: SUPERADMIN');
    console.log('   Status: ACTIVE');
    console.log('   Email Verified: true');
  } catch (error) {
    console.error('❌ Error seeding superadmin:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedSuperadmin()
    .then(() => {
      console.log('🎉 Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedSuperadmin };
