import { checkTables } from '../utils/dbCheck';
import { insertTestProduct } from '../utils/testData';
import { db } from '../config/database';

async function testLocalFlow() {
  console.log('\n🚀 Testing Local Flow\n');

  try {
    // 1. Check Database Connection
    console.log('Step 1: Checking database connection...');
    const [dbTest] = await db`SELECT NOW()`;
    console.log('✅ Database connected:', dbTest);

    // 2. Verify Tables
    console.log('\nStep 2: Verifying database tables...');
    const tablesOk = await checkTables();
    if (!tablesOk) {
      throw new Error('Required tables missing');
    }

    // 3. Test Product Creation
    console.log('\nStep 3: Testing product creation...');
    const product = await insertTestProduct();
    
    // 4. Verify Product in Database
    console.log('\nStep 4: Verifying product in database...');
    const [savedProduct] = await db`
      SELECT * FROM products WHERE id = ${product.id}
    `;
    console.log('✅ Product verified in database:', savedProduct);

    console.log('\n✨ Local flow test completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testLocalFlow();
}
