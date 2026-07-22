/**
 * Script to create a test member account for testing member portal
 * 
 * Run: npx tsx db/create_test_member_account.ts
 */

import { db, schema } from './index';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function createTestAccount() {
  console.log('🚀 Creating test member account...\n');

  try {
    // 1. Find first member in database
    const members = await db.select().from(schema.members).limit(1);
    
    if (members.length === 0) {
      console.error('❌ No members found in database. Please add a member first via admin CMS.');
      process.exit(1);
    }

    const member = members[0];
    console.log(`📝 Using member: ${member.name} (ID: ${member.id})`);
    console.log(`📧 Email: ${member.email || 'N/A'}\n`);

    // 2. Check if account already exists
    const existingAccounts = await db
      .select()
      .from(schema.memberAccounts)
      .where(eq(schema.memberAccounts.memberId, member.id))
      .limit(1);

    if (existingAccounts.length > 0) {
      console.log('⚠️  Member account already exists!');
      console.log('Updating password to: password123\n');
      
      const passwordHash = await bcrypt.hash('password123', 10);
      
      await db
        .update(schema.memberAccounts)
        .set({ 
          passwordHash,
          isActive: true,
        })
        .where(eq(schema.memberAccounts.memberId, member.id));
      
      console.log('✅ Password updated successfully!\n');
    } else {
      console.log('Creating new member account...');
      
      const passwordHash = await bcrypt.hash('password123', 10);
      
      await db.insert(schema.memberAccounts).values({
        memberId: member.id,
        passwordHash,
        isActive: true,
      });
      
      console.log('✅ Member account created successfully!\n');
    }

    // 3. Ensure member has email
    if (!member.email) {
      console.log('⚠️  Member has no email. Setting default email...');
      const testEmail = `test.member${member.id}@imud.com`;
      
      await db
        .update(schema.members)
        .set({ email: testEmail })
        .where(eq(schema.members.id, member.id));
      
      console.log(`✅ Email set to: ${testEmail}\n`);
    }

    console.log('🎉 Test account ready!\n');
    console.log('═'.repeat(50));
    console.log('Test Credentials:');
    console.log('═'.repeat(50));
    console.log(`Email:    ${member.email || `test.member${member.id}@imud.com`}`);
    console.log(`Password: password123`);
    console.log('═'.repeat(50));
    console.log('\nYou can now test:');
    console.log('1. POST http://localhost:3000/api/member/auth/login');
    console.log('2. GET  http://localhost:3000/api/member/auth/me');
    console.log('3. POST http://localhost:3000/api/member/auth/logout');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

createTestAccount()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Failed:', err);
    process.exit(1);
  });
