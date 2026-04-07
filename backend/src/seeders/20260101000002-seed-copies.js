/**
 * Seed copies for comprehensive test data.
 * Creates 12 copies (8 physical + 4 kindle) across 8 books.
 * Barcodes use SEED-BC- prefix, ASINs use SEED-ASIN- prefix.
 * Idempotent: skips if SEED-BC- copies already exist.
 */

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      "SELECT barcode FROM copies WHERE barcode LIKE 'SEED-BC-%'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      return;
    }

    const now = new Date();

    const books = await queryInterface.sequelize.query('SELECT id FROM books ORDER BY id LIMIT 8', {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (books.length < 8) {
      return;
    }

    await queryInterface.bulkInsert('copies', [
      {
        book_id: books[0].id,
        format: 'physical',
        copy_number: 10,
        barcode: 'SEED-BC-001',
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[1].id,
        format: 'physical',
        copy_number: 10,
        barcode: 'SEED-BC-002',
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[2].id,
        format: 'physical',
        copy_number: 10,
        barcode: 'SEED-BC-003',
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[3].id,
        format: 'physical',
        copy_number: 10,
        barcode: 'SEED-BC-004',
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[4].id,
        format: 'physical',
        copy_number: 10,
        barcode: 'SEED-BC-005',
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[5].id,
        format: 'physical',
        copy_number: 10,
        barcode: 'SEED-BC-006',
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[6].id,
        format: 'physical',
        copy_number: 10,
        barcode: 'SEED-BC-007',
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[7].id,
        format: 'physical',
        copy_number: 10,
        barcode: 'SEED-BC-008',
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[0].id,
        format: 'kindle',
        kindle_asin: 'SEED-ASIN-001',
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[1].id,
        format: 'kindle',
        kindle_asin: 'SEED-ASIN-002',
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[2].id,
        format: 'kindle',
        kindle_asin: 'SEED-ASIN-003',
        created_at: now,
        updated_at: now,
      },
      {
        book_id: books[3].id,
        format: 'kindle',
        kindle_asin: 'SEED-ASIN-004',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('copies', {
      barcode: { [Sequelize.Op.like]: 'SEED-BC-%' },
    });

    await queryInterface.bulkDelete('copies', {
      kindle_asin: { [Sequelize.Op.like]: 'SEED-%' },
    });
  },
};
