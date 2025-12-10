/* eslint-disable no-unused-vars */
/**
 * Additional test data for checkout functionality
 * Ensures we have available patrons and copies for manual testing
 */

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Check if patrons already exist
    const existingPatrons = await queryInterface.sequelize.query(
      'SELECT id FROM patrons WHERE card_number IN ("TEST001", "TEST002")',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Only add test patrons if they don't exist
    if (existingPatrons.length === 0) {
      await queryInterface.bulkInsert('patrons', [
        {
          card_number: 'TEST001',
          first_name: 'Test',
          last_name: 'Patron',
          email: 'test.patron@example.com',
          phone: '555-9999',
          status: 'active',
          created_at: now,
          updated_at: now,
        },
        {
          card_number: 'TEST002',
          first_name: 'Demo',
          last_name: 'User',
          email: 'demo.user@example.com',
          phone: '555-8888',
          status: 'active',
          created_at: now,
          updated_at: now,
        },
      ]);
      console.log('✅ Added test patrons for checkout testing');
    }

    // Get some books for testing
    const books = await queryInterface.sequelize.query(
      'SELECT id, title FROM books ORDER BY title LIMIT 5',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (books.length === 0) {
      console.log('⚠️  No books found. Please run book seeders first.');
      return;
    }

    // Check for existing copies on these books
    const existingCopies = await queryInterface.sequelize.query(
      `SELECT book_id FROM copies WHERE book_id IN (${books.map((b) => b.id).join(',')})`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const booksWithCopies = new Set(existingCopies.map((c) => c.book_id));

    // Add copies to books that don't have any yet
    const copiesToAdd = [];
    books.forEach((book) => {
      if (!booksWithCopies.has(book.id)) {
        // Add one physical copy
        copiesToAdd.push({
          book_id: book.id,
          format: 'physical',
          copy_number: 1,
          barcode: `TEST${book.id}001`,
          created_at: now,
          updated_at: now,
        });
        // Add one Kindle copy
        copiesToAdd.push({
          book_id: book.id,
          format: 'kindle',
          kindle_asin: `TEST${book.id}K01`,
          created_at: now,
          updated_at: now,
        });
      }
    });

    if (copiesToAdd.length > 0) {
      await queryInterface.bulkInsert('copies', copiesToAdd);
      console.log(`✅ Added ${copiesToAdd.length} test copies for checkout testing`);
    }

    // Report available test data
    const allPatrons = await queryInterface.sequelize.query(
      'SELECT id, card_number, first_name, last_name, status FROM patrons WHERE status = "active" ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const allCopies = await queryInterface.sequelize.query(
      'SELECT c.id, c.book_id, c.format, b.title FROM copies c JOIN books b ON c.book_id = b.id ORDER BY c.id LIMIT 10',
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log('\n📊 Test data available for checkout:');
    console.log('   Active Patrons:');
    allPatrons.slice(0, 5).forEach((p) => {
      console.log(`     - ID ${p.id}: ${p.first_name} ${p.last_name} (${p.card_number})`);
    });
    console.log('   Available Copies:');
    allCopies.slice(0, 5).forEach((c) => {
      console.log(`     - Copy ID ${c.id}: ${c.title} (${c.format})`);
    });
  },

  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async down(queryInterface, Sequelize) {
    // Delete test patrons
    await queryInterface.bulkDelete('patrons', {
      card_number: {
        [Sequelize.Op.in]: ['TEST001', 'TEST002'],
      },
    });

    // Delete test copies (checkouts will cascade delete)
    await queryInterface.sequelize.query(
      'DELETE FROM copies WHERE barcode LIKE "TEST%" OR kindle_asin LIKE "TEST%"'
    );
  },
};
