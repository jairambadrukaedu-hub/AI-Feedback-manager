const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./leads.db');

console.log('📊 Checking database contents...\n');

db.all('SELECT * FROM leads ORDER BY created_at DESC', [], (err, rows) => {
  if (err) {
    console.error('❌ Database error:', err);
  } else {
    console.log(`📝 Found ${rows.length} customers in database:\n`);
    
    if (rows.length === 0) {
      console.log('🔍 Database is empty - no customers found');
    } else {
      rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.name} (${row.phone})`);
        console.log(`   Email: ${row.email}`);
        console.log(`   Status: ${row.status}`);
        console.log(`   Created: ${row.created_at}`);
        if (row.feedback) {
          console.log(`   Has Feedback: YES`);
        } else {
          console.log(`   Has Feedback: NO`);
        }
        console.log('');
      });
    }
  }
  
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('🔒 Database connection closed.');
    }
  });
});