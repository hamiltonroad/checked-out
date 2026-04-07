/**
 * Seed patrons for comprehensive test data.
 * Card numbers use SEED- prefix to avoid collision with demo (LIB) and bulk (BULK-) patrons.
 * Covers all three statuses: active, inactive, suspended.
 * Idempotent: skips if SEED- patrons already exist.
 */

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async up(queryInterface, Sequelize) {
    const existing = await queryInterface.sequelize.query(
      "SELECT card_number FROM patrons WHERE card_number LIKE 'SEED-%'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      return;
    }

    const now = new Date();

    await queryInterface.bulkInsert('patrons', [
      {
        card_number: 'SEED-001',
        first_name: 'Dana',
        last_name: 'Reyes',
        email: 'dana.reyes@example.com',
        phone: '555-1001',
        status: 'active',
        role: 'admin',
        created_at: now,
        updated_at: now,
      },
      {
        card_number: 'SEED-002',
        first_name: 'Marcus',
        last_name: 'Thornton',
        email: 'marcus.thornton@example.com',
        phone: '555-1002',
        status: 'active',
        role: 'librarian',
        created_at: now,
        updated_at: now,
      },
      {
        card_number: 'SEED-003',
        first_name: 'Priya',
        last_name: 'Nair',
        email: 'priya.nair@example.com',
        phone: '555-1003',
        status: 'active',
        role: 'patron',
        created_at: now,
        updated_at: now,
      },
      {
        card_number: 'SEED-004',
        first_name: 'Jordan',
        last_name: 'Blake',
        email: 'jordan.blake@example.com',
        phone: '555-1004',
        status: 'active',
        role: 'patron',
        created_at: now,
        updated_at: now,
      },
      {
        card_number: 'SEED-005',
        first_name: 'Sofia',
        last_name: 'Alvarez',
        email: 'sofia.alvarez@example.com',
        phone: '555-1005',
        status: 'active',
        role: 'patron',
        created_at: now,
        updated_at: now,
      },
      {
        card_number: 'SEED-006',
        first_name: 'Owen',
        last_name: 'Fitzgerald',
        email: 'owen.fitzgerald@example.com',
        phone: '555-1006',
        status: 'active',
        role: 'patron',
        created_at: now,
        updated_at: now,
      },
      {
        card_number: 'SEED-007',
        first_name: 'Leila',
        last_name: 'Hassan',
        email: 'leila.hassan@example.com',
        phone: '555-1007',
        status: 'inactive',
        role: 'patron',
        created_at: now,
        updated_at: now,
      },
      {
        card_number: 'SEED-008',
        first_name: 'Derek',
        last_name: 'Kowalski',
        email: 'derek.kowalski@example.com',
        phone: '555-1008',
        status: 'suspended',
        role: 'patron',
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
    await queryInterface.bulkDelete('patrons', {
      card_number: { [Sequelize.Op.like]: 'SEED-%' },
    });
  },
};
