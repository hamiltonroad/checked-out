/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [results] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM book_authors'
    );

    if (results[0].count > 0) {
      return;
    }

    // Get book and author IDs dynamically
    const [books] = await queryInterface.sequelize.query('SELECT id, title FROM books ORDER BY id');
    const [authors] = await queryInterface.sequelize.query(
      'SELECT id, first_name, last_name FROM authors ORDER BY id'
    );

    // Create helper function to find IDs
    const findBookId = (title) => {
      const book = books.find((b) => b.title === title);
      return book ? book.id : null;
    };
    const findAuthorId = (lastName) => {
      const author = authors.find((a) => a.last_name === lastName);
      return author ? author.id : null;
    };

    const now = new Date();
    const bookAuthors = [
      // Fiction
      {
        book_id: findBookId('To Kill a Mockingbird'),
        author_id: findAuthorId('Lee'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('1984'),
        author_id: findAuthorId('Orwell'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Great Gatsby'),
        author_id: findAuthorId('Fitzgerald'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Catcher in the Rye'),
        author_id: findAuthorId('Salinger'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Pride and Prejudice'),
        author_id: findAuthorId('Austen'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('To the Lighthouse'),
        author_id: findAuthorId('Woolf'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('One Hundred Years of Solitude'),
        author_id: findAuthorId('García Márquez'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Beloved'),
        author_id: findAuthorId('Morrison'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId("The Handmaid's Tale"),
        author_id: findAuthorId('Atwood'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Fault in Our Stars'),
        author_id: findAuthorId('Green'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId("The Hitchhiker's Guide to the Galaxy"),
        author_id: findAuthorId('Adams'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Kite Runner'),
        author_id: findAuthorId('Hosseini'),
        created_at: now,
        updated_at: now,
      },

      // Science Fiction
      {
        book_id: findBookId('Dune'),
        author_id: findAuthorId('Herbert'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Foundation'),
        author_id: findAuthorId('Asimov'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId("Ender's Game"),
        author_id: findAuthorId('Card'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Ready Player One'),
        author_id: findAuthorId('Cline'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Neuromancer'),
        author_id: findAuthorId('Gibson'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Left Hand of Darkness'),
        author_id: findAuthorId('Le Guin'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Martian'),
        author_id: findAuthorId('Weir'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('A Fire Upon the Deep'),
        author_id: findAuthorId('Vinge'),
        created_at: now,
        updated_at: now,
      },

      // Mystery
      {
        book_id: findBookId('And Then There Were None'),
        author_id: findAuthorId('Christie'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Girl with the Dragon Tattoo'),
        author_id: findAuthorId('Larsson'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Gone Girl'),
        author_id: findAuthorId('Flynn'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Silent Patient'),
        author_id: findAuthorId('Michaelides'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Da Vinci Code'),
        author_id: findAuthorId('Brown'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Big Little Lies'),
        author_id: findAuthorId('Moriarty'),
        created_at: now,
        updated_at: now,
      },

      // Fantasy
      {
        book_id: findBookId('The Hobbit'),
        author_id: findAuthorId('Tolkien'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId("Harry Potter and the Sorcerer's Stone"),
        author_id: findAuthorId('Rowling'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('A Game of Thrones'),
        author_id: findAuthorId('Martin'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Name of the Wind'),
        author_id: findAuthorId('Rothfuss'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Way of Kings'),
        author_id: findAuthorId('Sanderson'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('American Gods'),
        author_id: findAuthorId('Gaiman'),
        created_at: now,
        updated_at: now,
      },

      // Biography
      {
        book_id: findBookId('Steve Jobs'),
        author_id: findAuthorId('Isaacson'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Autobiography of Benjamin Franklin'),
        author_id: findAuthorId('Franklin'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Diary of a Young Girl'),
        author_id: findAuthorId('Frank'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Unbroken'),
        author_id: findAuthorId('Hillenbrand'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Educated'),
        author_id: findAuthorId('Westover'),
        created_at: now,
        updated_at: now,
      },

      // History
      {
        book_id: findBookId('Sapiens: A Brief History of Humankind'),
        author_id: findAuthorId('Harari'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Guns, Germs, and Steel'),
        author_id: findAuthorId('Diamond'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Devil in the White City'),
        author_id: findAuthorId('Larson'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Dead Wake'),
        author_id: findAuthorId('Larson'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Team of Rivals'),
        author_id: findAuthorId('Goodwin'),
        created_at: now,
        updated_at: now,
      },

      // Science
      {
        book_id: findBookId('A Brief History of Time'),
        author_id: findAuthorId('Hawking'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Selfish Gene'),
        author_id: findAuthorId('Dawkins'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Cosmos'),
        author_id: findAuthorId('Sagan'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Astrophysics for People in a Hurry'),
        author_id: findAuthorId('Tyson'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Gene: An Intimate History'),
        author_id: findAuthorId('Mukherjee'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Emperor of All Maladies'),
        author_id: findAuthorId('Mukherjee'),
        created_at: now,
        updated_at: now,
      },

      // Self-Help
      {
        book_id: findBookId('Atomic Habits'),
        author_id: findAuthorId('Clear'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('How to Win Friends and Influence People'),
        author_id: findAuthorId('Carnegie'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The 7 Habits of Highly Effective People'),
        author_id: findAuthorId('Covey'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Subtle Art of Not Giving a F*ck'),
        author_id: findAuthorId('Manson'),
        created_at: now,
        updated_at: now,
      },

      // Philosophy
      {
        book_id: findBookId("Man's Search for Meaning"),
        author_id: findAuthorId('Frankl'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Meditations'),
        author_id: findAuthorId('Aurelius'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('The Republic'),
        author_id: findAuthorId(''),
        created_at: now,
        updated_at: now,
      },

      // Horror
      {
        book_id: findBookId('The Shining'),
        author_id: findAuthorId('King'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('It'),
        author_id: findAuthorId('King'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Frankenstein'),
        author_id: findAuthorId('Shelley'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Dracula'),
        author_id: findAuthorId('Stoker'),
        created_at: now,
        updated_at: now,
      },

      // Poetry
      {
        book_id: findBookId('The Complete Poems'),
        author_id: findAuthorId('Dickinson'),
        created_at: now,
        updated_at: now,
      },
      {
        book_id: findBookId('Milk and Honey'),
        author_id: findAuthorId('Kaur'),
        created_at: now,
        updated_at: now,
      },
    ];

    // Filter out any null entries (in case book or author not found)
    const validBookAuthors = bookAuthors.filter((ba) => ba.book_id && ba.author_id);

    if (validBookAuthors.length === 0) {
      throw new Error(
        'No valid book-author relationships found. Ensure books and authors are seeded first.'
      );
    }

    await queryInterface.bulkInsert('book_authors', validBookAuthors, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('book_authors', null, {});
  },
};
