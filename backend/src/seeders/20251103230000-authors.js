/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [results] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM authors');

    if (results[0].count > 0) {
      return;
    }

    const now = new Date();
    const authors = [
      // Fiction authors
      { first_name: 'Harper', last_name: 'Lee', created_at: now, updated_at: now },
      { first_name: 'George', last_name: 'Orwell', created_at: now, updated_at: now },
      { first_name: 'F. Scott', last_name: 'Fitzgerald', created_at: now, updated_at: now },
      { first_name: 'J.D.', last_name: 'Salinger', created_at: now, updated_at: now },
      { first_name: 'Jane', last_name: 'Austen', created_at: now, updated_at: now },
      { first_name: 'Virginia', last_name: 'Woolf', created_at: now, updated_at: now },
      { first_name: 'Gabriel', last_name: 'García Márquez', created_at: now, updated_at: now },
      { first_name: 'Toni', last_name: 'Morrison', created_at: now, updated_at: now },
      { first_name: 'Margaret', last_name: 'Atwood', created_at: now, updated_at: now },
      { first_name: 'John', last_name: 'Green', created_at: now, updated_at: now },
      { first_name: 'Douglas', last_name: 'Adams', created_at: now, updated_at: now },
      { first_name: 'Khaled', last_name: 'Hosseini', created_at: now, updated_at: now },

      // Science Fiction authors
      { first_name: 'Frank', last_name: 'Herbert', created_at: now, updated_at: now },
      { first_name: 'Isaac', last_name: 'Asimov', created_at: now, updated_at: now },
      { first_name: 'Orson Scott', last_name: 'Card', created_at: now, updated_at: now },
      { first_name: 'Ernest', last_name: 'Cline', created_at: now, updated_at: now },
      { first_name: 'William', last_name: 'Gibson', created_at: now, updated_at: now },
      { first_name: 'Ursula K.', last_name: 'Le Guin', created_at: now, updated_at: now },
      { first_name: 'Andy', last_name: 'Weir', created_at: now, updated_at: now },
      { first_name: 'Vernor', last_name: 'Vinge', created_at: now, updated_at: now },

      // Mystery authors
      { first_name: 'Agatha', last_name: 'Christie', created_at: now, updated_at: now },
      { first_name: 'Stieg', last_name: 'Larsson', created_at: now, updated_at: now },
      { first_name: 'Gillian', last_name: 'Flynn', created_at: now, updated_at: now },
      { first_name: 'Alex', last_name: 'Michaelides', created_at: now, updated_at: now },
      { first_name: 'Dan', last_name: 'Brown', created_at: now, updated_at: now },
      { first_name: 'Liane', last_name: 'Moriarty', created_at: now, updated_at: now },

      // Fantasy authors
      { first_name: 'J.R.R.', last_name: 'Tolkien', created_at: now, updated_at: now },
      { first_name: 'J.K.', last_name: 'Rowling', created_at: now, updated_at: now },
      { first_name: 'George R.R.', last_name: 'Martin', created_at: now, updated_at: now },
      { first_name: 'Patrick', last_name: 'Rothfuss', created_at: now, updated_at: now },
      { first_name: 'Brandon', last_name: 'Sanderson', created_at: now, updated_at: now },
      { first_name: 'Neil', last_name: 'Gaiman', created_at: now, updated_at: now },

      // Biography authors
      { first_name: 'Walter', last_name: 'Isaacson', created_at: now, updated_at: now },
      { first_name: 'Benjamin', last_name: 'Franklin', created_at: now, updated_at: now },
      { first_name: 'Anne', last_name: 'Frank', created_at: now, updated_at: now },
      { first_name: 'Laura', last_name: 'Hillenbrand', created_at: now, updated_at: now },
      { first_name: 'Tara', last_name: 'Westover', created_at: now, updated_at: now },

      // History authors
      { first_name: 'Yuval Noah', last_name: 'Harari', created_at: now, updated_at: now },
      { first_name: 'Jared', last_name: 'Diamond', created_at: now, updated_at: now },
      { first_name: 'Erik', last_name: 'Larson', created_at: now, updated_at: now },
      { first_name: 'Doris Kearns', last_name: 'Goodwin', created_at: now, updated_at: now },

      // Science authors
      { first_name: 'Stephen', last_name: 'Hawking', created_at: now, updated_at: now },
      { first_name: 'Richard', last_name: 'Dawkins', created_at: now, updated_at: now },
      { first_name: 'Carl', last_name: 'Sagan', created_at: now, updated_at: now },
      { first_name: 'Neil deGrasse', last_name: 'Tyson', created_at: now, updated_at: now },
      { first_name: 'Siddhartha', last_name: 'Mukherjee', created_at: now, updated_at: now },

      // Self-Help authors
      { first_name: 'James', last_name: 'Clear', created_at: now, updated_at: now },
      { first_name: 'Dale', last_name: 'Carnegie', created_at: now, updated_at: now },
      { first_name: 'Stephen', last_name: 'Covey', created_at: now, updated_at: now },
      { first_name: 'Mark', last_name: 'Manson', created_at: now, updated_at: now },

      // Philosophy authors
      { first_name: 'Viktor', last_name: 'Frankl', created_at: now, updated_at: now },
      { first_name: 'Marcus', last_name: 'Aurelius', created_at: now, updated_at: now },
      { first_name: 'Plato', last_name: '', created_at: now, updated_at: now },

      // Horror authors
      { first_name: 'Stephen', last_name: 'King', created_at: now, updated_at: now },
      { first_name: 'Mary', last_name: 'Shelley', created_at: now, updated_at: now },
      { first_name: 'Bram', last_name: 'Stoker', created_at: now, updated_at: now },

      // Poetry authors
      { first_name: 'Emily', last_name: 'Dickinson', created_at: now, updated_at: now },
      { first_name: 'Rupi', last_name: 'Kaur', created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('authors', authors, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('authors', null, {});
  },
};
