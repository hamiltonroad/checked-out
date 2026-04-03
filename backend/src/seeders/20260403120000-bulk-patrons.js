/* eslint-disable no-unused-vars, no-console */
const bcrypt = require('bcrypt');

/**
 * Bulk patron seeder — creates 5,000 realistic patron records for testing.
 * All patrons use password "welcome123" (bcrypt-hashed).
 * Card numbers use BULK-XXXXX format to avoid collision with demo patrons.
 * Idempotent: skips if bulk patrons already exist.
 */

const SALT_ROUNDS = 12;
const DEV_PASSWORD = 'welcome123';
const PATRON_COUNT = 5000;
const BULK_CARD_PREFIX = 'BULK-';
const IDEMPOTENCY_THRESHOLD = 100;

// Curated first names (100 entries, diverse backgrounds)
const FIRST_NAMES = [
  'James',
  'Maria',
  'Robert',
  'Patricia',
  'Michael',
  'Jennifer',
  'William',
  'Linda',
  'David',
  'Elizabeth',
  'Richard',
  'Barbara',
  'Joseph',
  'Susan',
  'Thomas',
  'Jessica',
  'Christopher',
  'Sarah',
  'Charles',
  'Karen',
  'Daniel',
  'Lisa',
  'Matthew',
  'Nancy',
  'Anthony',
  'Betty',
  'Mark',
  'Margaret',
  'Donald',
  'Sandra',
  'Steven',
  'Ashley',
  'Andrew',
  'Dorothy',
  'Paul',
  'Kimberly',
  'Joshua',
  'Emily',
  'Kenneth',
  'Donna',
  'Kevin',
  'Michelle',
  'Brian',
  'Carol',
  'George',
  'Amanda',
  'Timothy',
  'Melissa',
  'Ronald',
  'Deborah',
  'Jason',
  'Stephanie',
  'Edward',
  'Rebecca',
  'Jeffrey',
  'Sharon',
  'Ryan',
  'Laura',
  'Jacob',
  'Cynthia',
  'Nicholas',
  'Kathleen',
  'Gary',
  'Amy',
  'Eric',
  'Angela',
  'Jonathan',
  'Shirley',
  'Stephen',
  'Brenda',
  'Larry',
  'Emma',
  'Justin',
  'Anna',
  'Scott',
  'Pamela',
  'Brandon',
  'Nicole',
  'Benjamin',
  'Samantha',
  'Samuel',
  'Katherine',
  'Raymond',
  'Christine',
  'Gregory',
  'Helen',
  'Frank',
  'Debra',
  'Alexander',
  'Rachel',
  'Patrick',
  'Carolyn',
  'Jack',
  'Janet',
  'Dennis',
  'Catherine',
  'Jerry',
  'Heather',
  'Tyler',
  'Diane',
];

// Curated last names (100 entries, diverse backgrounds)
const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
  'Young',
  'Allen',
  'King',
  'Wright',
  'Scott',
  'Torres',
  'Nguyen',
  'Hill',
  'Flores',
  'Green',
  'Adams',
  'Nelson',
  'Baker',
  'Hall',
  'Rivera',
  'Campbell',
  'Mitchell',
  'Carter',
  'Roberts',
  'Gomez',
  'Phillips',
  'Evans',
  'Turner',
  'Diaz',
  'Parker',
  'Cruz',
  'Edwards',
  'Collins',
  'Reyes',
  'Stewart',
  'Morris',
  'Morales',
  'Murphy',
  'Cook',
  'Rogers',
  'Gutierrez',
  'Ortiz',
  'Morgan',
  'Cooper',
  'Peterson',
  'Bailey',
  'Reed',
  'Kelly',
  'Howard',
  'Ramos',
  'Kim',
  'Cox',
  'Ward',
  'Richardson',
  'Watson',
  'Brooks',
  'Chavez',
  'Wood',
  'James',
  'Bennett',
  'Gray',
  'Mendoza',
  'Ruiz',
  'Hughes',
  'Price',
  'Alvarez',
  'Castillo',
  'Sanders',
  'Patel',
  'Myers',
  'Long',
  'Ross',
  'Foster',
  'Jimenez',
];

/**
 * Determine patron status using weighted distribution.
 * 80% active, 10% inactive, 10% suspended.
 * @param {number} index - Patron index (0-based)
 * @returns {string} Status string
 */
function getStatus(index) {
  const bucket = index % 10;
  if (bucket >= 8) {
    return bucket === 8 ? 'inactive' : 'suspended';
  }
  return 'active';
}

/**
 * Generate a zero-padded card number.
 * @param {number} index - 1-based patron index
 * @returns {string} Card number in BULK-XXXXX format
 */
function formatCardNumber(index) {
  return `${BULK_CARD_PREFIX}${String(index).padStart(5, '0')}`;
}

/**
 * Generate a phone number from index.
 * @param {number} index - 1-based patron index
 * @returns {string} Phone in 555-XXX-XXXX format
 */
function formatPhone(index) {
  const areaCode = String(100 + Math.floor(index / 10000)).slice(-3);
  const prefix = String(index % 10000)
    .padStart(4, '0')
    .slice(0, 3);
  const suffix = String(index).padStart(4, '0').slice(-4);
  return `555-${prefix}-${suffix}`;
}

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async up(queryInterface, Sequelize) {
    // Idempotency check: skip if patrons already exist beyond demo count
    const [results] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM patrons');
    const patronCount = parseInt(results[0].count, 10);

    if (patronCount > IDEMPOTENCY_THRESHOLD) {
      console.log(
        `Skipping bulk patron seed: ${patronCount} patrons already exist (threshold: ${IDEMPOTENCY_THRESHOLD}).`
      );
      return;
    }

    // Hash the password once and reuse for all records
    const passwordHash = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);
    const now = new Date();

    const firstNameCount = FIRST_NAMES.length;
    const lastNameCount = LAST_NAMES.length;

    const patrons = [];
    for (let i = 0; i < PATRON_COUNT; i += 1) {
      const firstName = FIRST_NAMES[i % firstNameCount];
      const lastName = LAST_NAMES[Math.floor(i / firstNameCount) % lastNameCount];
      const cardIndex = i + 1;

      patrons.push({
        card_number: formatCardNumber(cardIndex),
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${cardIndex}@example.com`,
        phone: formatPhone(cardIndex),
        status: getStatus(i),
        password_hash: passwordHash,
        created_at: now,
        updated_at: now,
      });
    }

    await queryInterface.bulkInsert('patrons', patrons);

    console.log(
      `Seeded ${PATRON_COUNT} bulk patrons (card numbers ${BULK_CARD_PREFIX}00001 to ${BULK_CARD_PREFIX}05000).`
    );
    console.log(`Dev password for all bulk patrons: ${DEV_PASSWORD}`);
  },

  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize').Sequelize} Sequelize
   */
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('patrons', {
      card_number: { [Sequelize.Op.like]: `${BULK_CARD_PREFIX}%` },
    });
    console.log('Removed all bulk patron records.');
  },
};
