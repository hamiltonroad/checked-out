const { QueryInterface, Sequelize } = require('sequelize');

/**
 * Seed copies and checkouts for testing availability filter
 * Creates scenarios:
 * - Books with available copies
 * - Books that are currently checked out
 * - Books with overdue checkouts
 */
module.exports = {
  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   */
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twentyOneDaysAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Get some book IDs to use
    const books = await queryInterface.sequelize.query(
      'SELECT id, title FROM books ORDER BY title LIMIT 10',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (books.length === 0) {
      console.log('No books found. Please run book seeders first.');
      return;
    }

    // Create patrons first
    await queryInterface.bulkInsert('patrons', [
      {
        card_number: 'LIB001',
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '555-0101',
        status: 'active',
        created_at: now,
        updated_at: now,
      },
      {
        card_number: 'LIB002',
        first_name: 'Bob',
        last_name: 'Smith',
        email: 'bob.smith@example.com',
        phone: '555-0102',
        status: 'active',
        created_at: now,
        updated_at: now,
      },
      {
        card_number: 'LIB003',
        first_name: 'Carol',
        last_name: 'Williams',
        email: 'carol.williams@example.com',
        phone: '555-0103',
        status: 'active',
        created_at: now,
        updated_at: now,
      },
    ]);

    // Get patron IDs
    const patrons = await queryInterface.sequelize.query(
      'SELECT id FROM patrons ORDER BY id DESC LIMIT 3',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create copies for books
    const copies = [
      // Book 1: Two copies, both available
      {
        book_id: books[0].id,
        format: 'physical',
        copy_number: 1,
        barcode: `BC${books[0].id}001`,
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[0].id,
        format: 'physical',
        copy_number: 2,
        barcode: `BC${books[0].id}002`,
        created_at: now,
        updated_at: now,
      },
      // Book 2: One copy, currently checked out (not overdue)
      {
        book_id: books[1].id,
        format: 'physical',
        copy_number: 1,
        barcode: `BC${books[1].id}001`,
        created_at: now,
        updated_at: now,
      },
      // Book 3: One copy, overdue
      {
        book_id: books[2].id,
        format: 'physical',
        copy_number: 1,
        barcode: `BC${books[2].id}001`,
        created_at: now,
        updated_at: now,
      },
      // Book 4: Two copies, one checked out, one available
      {
        book_id: books[3].id,
        format: 'physical',
        copy_number: 1,
        barcode: `BC${books[3].id}001`,
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[3].id,
        format: 'kindle',
        kindle_asin: 'B00KINDLE01',
        created_at: now,
        updated_at: now,
      },
      // Book 5: One Kindle copy, checked out
      {
        book_id: books[4].id,
        format: 'kindle',
        kindle_asin: 'B00KINDLE02',
        created_at: now,
        updated_at: now,
      },
      // Book 6: One physical copy, returned (was checked out but now available)
      {
        book_id: books[5].id,
        format: 'physical',
        copy_number: 1,
        barcode: `BC${books[5].id}001`,
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('copies', copies);

    // Get copy IDs
    const insertedCopies = await queryInterface.sequelize.query(
      'SELECT id, book_id FROM copies ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create checkouts
    const checkouts = [
      // Book 2 (index 2): Currently checked out, not overdue
      {
        copy_id: insertedCopies[2].id,
        patron_id: patrons[0].id,
        checkout_date: fourteenDaysAgo,
        due_date: fourteenDaysFromNow,
        return_date: null,
        created_at: now,
        updated_at: now,
      },
      // Book 3 (index 3): Overdue checkout
      {
        copy_id: insertedCopies[3].id,
        patron_id: patrons[1].id,
        checkout_date: twentyOneDaysAgo,
        due_date: sevenDaysFromNow,
        return_date: null,
        created_at: now,
        updated_at: now,
      },
      // Book 4 (index 4): One copy checked out (physical), Kindle available
      {
        copy_id: insertedCopies[4].id,
        patron_id: patrons[2].id,
        checkout_date: fourteenDaysAgo,
        due_date: fourteenDaysFromNow,
        return_date: null,
        created_at: now,
        updated_at: now,
      },
      // Book 5 (index 6): Kindle checked out
      {
        copy_id: insertedCopies[6].id,
        patron_id: patrons[0].id,
        checkout_date: fourteenDaysAgo,
        due_date: fourteenDaysFromNow,
        return_date: null,
        created_at: now,
        updated_at: now,
      },
      // Book 6 (index 7): Was checked out but now returned
      {
        copy_id: insertedCopies[7].id,
        patron_id: patrons[1].id,
        checkout_date: twentyOneDaysAgo,
        due_date: sevenDaysFromNow,
        return_date: fourteenDaysAgo,
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert('checkouts', checkouts);

    console.log('✅ Seeded copies and checkouts:');
    console.log(`   - ${books[0].title}: 2 copies, both AVAILABLE`);
    console.log(`   - ${books[1].title}: 1 copy, CHECKED OUT (not overdue)`);
    console.log(`   - ${books[2].title}: 1 copy, CHECKED OUT (OVERDUE)`);
    console.log(`   - ${books[3].title}: 2 copies, 1 checked out, 1 AVAILABLE`);
    console.log(`   - ${books[4].title}: 1 Kindle copy, CHECKED OUT`);
    console.log(`   - ${books[5].title}: 1 copy, AVAILABLE (previously returned)`);
  },

  /**
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   */
  async down(queryInterface, Sequelize) {
    // Delete in reverse order due to foreign key constraints
    await queryInterface.bulkDelete('checkouts', null, {});
    await queryInterface.bulkDelete('copies', null, {});
    await queryInterface.bulkDelete('patrons', {
      card_number: {
        [Sequelize.Op.in]: ['LIB001', 'LIB002', 'LIB003'],
      },
    });
  },
};
