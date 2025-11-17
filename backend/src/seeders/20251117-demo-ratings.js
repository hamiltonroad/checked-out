'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add demo ratings for testing
    await queryInterface.bulkInsert('ratings', [
      {
        book_id: 185, // 1984
        patron_id: 1,
        rating: 5,
        review_text: 'An absolute masterpiece! This book changed my perspective on life.',
        created_at: new Date('2024-11-01'),
        updated_at: new Date('2024-11-01'),
      },
      {
        book_id: 185, // 1984
        patron_id: 2,
        rating: 4,
        review_text: 'Great read, though some parts were a bit slow.',
        created_at: new Date('2024-11-05'),
        updated_at: new Date('2024-11-05'),
      },
      {
        book_id: 185, // 1984
        patron_id: 3,
        rating: 5,
        review_text: null,
        created_at: new Date('2024-11-10'),
        updated_at: new Date('2024-11-10'),
      },
      {
        book_id: 226, // A Brief History of Time
        patron_id: 1,
        rating: 3,
        review_text: 'It was okay. Not my favorite but worth reading once.',
        created_at: new Date('2024-11-12'),
        updated_at: new Date('2024-11-12'),
      },
      {
        book_id: 226, // A Brief History of Time
        patron_id: 2,
        rating: 4,
        review_text: 'Enjoyed the explanations of complex physics concepts.',
        created_at: new Date('2024-11-15'),
        updated_at: new Date('2024-11-15'),
      },
      {
        book_id: 203, // A Fire Upon the Deep
        patron_id: 2,
        rating: 5,
        review_text: 'Couldn\'t put it down! Finished it in one sitting.',
        created_at: new Date('2024-11-08'),
        updated_at: new Date('2024-11-08'),
      },
      {
        book_id: 212, // A Game of Thrones
        patron_id: 1,
        rating: 5,
        review_text: 'Best fantasy book I\'ve read this year. Highly recommend!',
        created_at: new Date('2024-11-16'),
        updated_at: new Date('2024-11-16'),
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ratings', null, {});
  }
};