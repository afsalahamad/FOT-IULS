import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import './Admin.css';

interface Book {
    id: number;
    title: string;
    author: string;
    category: string;
    rating: number;
    image: string;
    description: string;
}

function Admin() {

    // Initial book data
    const [books, setBooks] = useState<Book[]>([
        {
            id: 1,
            title: 'Artificial Intelligence',
            author: 'Stuart Russell',
            category: 'Technology',
            rating: 4.8,
            image: '/images/ai.jfif',
            description: 'An introduction to artificial intelligence.'
        },
        {
            id: 2,
            title: 'Sustainable Cities',
            author: 'Vanessa Hall',
            category: 'Environment',
            rating: 4.7,
            image: '',
            description: 'A study of sustainable cities.'
        },
        {
            id: 3,
            title: 'Data Science for Research',
            author: 'Mark Thompson',
            category: 'Data Science',
            rating: 4.6,
            image: '',
            description: 'Learn data science for research.'
        },
        {
            id: 4,
            title: 'Deep Learning Basics',
            author: 'Ian Goodfellow',
            category: 'AI',
            rating: 4.9,
            image: '',
            description: 'Learn the fundamentals of deep learning.'
        },
        {
            id: 5,
            title: 'Computer Networks',
            author: 'Andrew S. Tanenbaum',
            category: 'Networking',
            rating: 4.7,
            image: '',
            description: 'Introduction to computer networking.'
        }
    ]);

    // Form states
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('');
    const [rating, setRating] = useState('4.5');
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');

    // Other states
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [editId, setEditId] = useState<number | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    // Handle image upload
    function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {

        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setImage(reader.result as string);
        };

        reader.readAsDataURL(file);
    }

    // Clear form
    function clearForm() {

        setTitle('');
        setAuthor('');
        setCategory('');
        setRating('4.5');
        setImage('');
        setDescription('');
        setEditId(null);

    }

    // Add or update book
    function handleSubmit(e: FormEvent<HTMLFormElement>) {

        e.preventDefault();

        const bookData: Book = {
            id: editId ?? Date.now(),
            title,
            author,
            category,
            rating: Number(rating),
            image,
            description
        };

        if (editId !== null) {

            setBooks(books.map((book) =>
                book.id === editId ? bookData : book
            ));

            alert('Book updated successfully!');

        } else {

            setBooks([...books, bookData]);

            alert('Book added successfully!');

        }

        clearForm();

    }

    // Edit book
    function handleEdit(book: Book) {

        setTitle(book.title);
        setAuthor(book.author);
        setCategory(book.category);
        setRating(String(book.rating));
        setImage(book.image);
        setDescription(book.description);

        setEditId(book.id);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    }

    // Delete book
    function handleDelete(id: number) {

        const confirmDelete = window.confirm(
            'Are you sure you want to delete this book?'
        );

        if (confirmDelete) {

            setBooks(books.filter((book) => book.id !== id));

            if (editId === id) {
                clearForm();
            }

        }

    }

    // Search and filter
    const filteredBooks = books.filter((book) => {

        const matchesSearch =
            book.title.toLowerCase().includes(search.toLowerCase()) ||
            book.author.toLowerCase().includes(search.toLowerCase());

        const matchesCategory =
            filter === 'All' || book.category === filter;

        return matchesSearch && matchesCategory;

    });

    // Dashboard
    return (

        <div className="admin-page">

            {/* TOP HEADER */}

            <header className="admin-header">

                <div className="admin-brand">

                    <span className="brand-icon">📖</span>

                    <h2>Admin Dashboard</h2>

                </div>

                <div className="admin-user">

                    <div className="admin-avatar">👤</div>

                    <strong>Admin</strong>

                    <span>⌄</span>

                </div>

            </header>


            {/* WELCOME BANNER */}

            <section className="welcome-banner">

                <div className="welcome-icon">👑</div>

                <div className="welcome-text">

                    <h1>Welcome, Admin!</h1>

                    <p>Manage books, chapters and users from here.</p>

                </div>

                <div className="admin-date">

                    📅 November 18, 2026

                </div>

            </section>


            {/* STATISTICS */}

            <section className="admin-stats">

                <div className="stat-card stat-blue">

                    <div className="stat-icon">📖</div>

                    <div>
                        <h2>{books.length}</h2>
                        <p>Total Books</p>
                    </div>

                </div>


                <div className="stat-card stat-green">

                    <div className="stat-icon">📄</div>

                    <div>
                        <h2>156</h2>
                        <p>Total Chapters</p>
                    </div>

                </div>


                <div className="stat-card stat-purple">

                    <div className="stat-icon">👥</div>

                    <div>
                        <h2>1,250</h2>
                        <p>Registered Users</p>
                    </div>

                </div>


                <div className="stat-card stat-orange">

                    <div className="stat-icon">📝</div>

                    <div>
                        <h2>8,430</h2>
                        <p>Total Notes</p>
                    </div>

                </div>

            </section>


            {/* MAIN BOOK MANAGEMENT */}

            <section className="book-management">


                {/* ADD NEW BOOK FORM */}

                <div className="add-book-card">

                    <h2>
                        <span className="plus-icon">＋</span>
                        {editId !== null ? 'Edit Book' : 'Add New Book'}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <label>Book Title <span>*</span></label>

                        <input
                            type="text"
                            placeholder="Enter book title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />


                        <label>Author <span>*</span></label>

                        <input
                            type="text"
                            placeholder="Enter author name"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            required
                        />


                        <label>Category</label>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >

                            <option value="">Select Category</option>
                            <option value="Technology">Technology</option>
                            <option value="Environment">Environment</option>
                            <option value="Data Science">Data Science</option>
                            <option value="AI">AI</option>
                            <option value="Networking">Networking</option>

                        </select>


                        <label>Book Rating</label>

                        <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            required
                        />


                        <label>Book Image</label>

                        <div className="image-upload">

                            <input
                                type="file"
                                accept="image/*"
                                id="book-image"
                                onChange={handleImageUpload}
                            />

                            <label htmlFor="book-image">

                                {image ? (
                                    <img
                                        src={image}
                                        alt="Book preview"
                                        className="upload-preview"
                                    />
                                ) : (
                                    <>
                                        <span className="upload-icon">☁</span>
                                        <strong>Click to upload image</strong>
                                        <small>(JPG, PNG, GIF)</small>
                                    </>
                                )}

                            </label>

                        </div>


                        <label>Description</label>

                        <textarea
                            placeholder="Enter book description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />


                        <div className="form-buttons">

                            <button type="submit" className="add-book-btn">
                                ＋ {editId !== null ? 'Update Book' : 'Add Book'}
                            </button>

                            <button
                                type="button"
                                className="reset-btn"
                                onClick={clearForm}
                            >
                                ↻ Reset
                            </button>

                        </div>

                    </form>

                </div>


                {/* BOOK LIST TABLE */}

                <div className="book-list-card">

                    <div className="book-list-header">

                        <h2>📖 Book List</h2>

                        <div className="book-tools">

                            <input
                                type="text"
                                placeholder="⌕  Search books..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="filter-select"
                            >

                                <option value="All">All Categories</option>
                                <option value="Technology">Technology</option>
                                <option value="Environment">Environment</option>
                                <option value="Data Science">Data Science</option>
                                <option value="AI">AI</option>
                                <option value="Networking">Networking</option>

                            </select>

                        </div>

                    </div>


                    <div className="table-container">

                        <table className="book-table">

                            <thead>

                                <tr>
                                    <th>#</th>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Category</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>


                            <tbody>

                                {filteredBooks.map((book, index) => (

                                    <tr key={book.id}>

                                        <td>{index + 1}</td>

                                        <td>

                                            {book.image ? (
                                                <img
                                                    src={book.image}
                                                    alt={book.title}
                                                    className="table-book-image"
                                                />
                                            ) : (
                                                <div className="no-image">📖</div>
                                            )}

                                        </td>

                                        <td className="book-title-cell">
                                            {book.title}
                                        </td>

                                        <td>{book.author}</td>

                                        <td>
                                            <span className="category-tag">
                                                {book.category}
                                            </span>
                                        </td>

                                        <td className="rating-cell">
                                            ⭐ {book.rating.toFixed(1)}
                                        </td>

                                        <td>

                                            <div className="table-actions">

                                                <button
                                                    className="edit-btn"
                                                    title="Edit Book"
                                                    onClick={() => handleEdit(book)}
                                                >
                                                    ✎
                                                </button>

                                                <button
                                                    className="delete-btn"
                                                    title="Delete Book"
                                                    onClick={() => handleDelete(book.id)}
                                                >
                                                    🗑
                                                </button>

                                                <button
                                                    className="view-btn"
                                                    title="View Book"
                                                    onClick={() => setSelectedBook(book)}
                                                >
                                                    ◉
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}


                                {filteredBooks.length === 0 && (

                                    <tr>
                                        <td colSpan={7} className="empty-message">
                                            No books found.
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>


                    <div className="table-footer">

                        Showing {filteredBooks.length} of {books.length} books

                    </div>

                </div>

            </section>


            {/* VIEW BOOK MODAL */}

            {selectedBook && (

                <div className="modal-overlay">

                    <div className="book-modal">

                        <button
                            className="modal-close"
                            onClick={() => setSelectedBook(null)}
                        >
                            ×
                        </button>

                        {selectedBook.image && (
                            <img
                                src={selectedBook.image}
                                alt={selectedBook.title}
                                className="modal-book-image"
                            />
                        )}

                        <h2>{selectedBook.title}</h2>

                        <p><strong>Author:</strong> {selectedBook.author}</p>

                        <p><strong>Category:</strong> {selectedBook.category}</p>

                        <p><strong>Rating:</strong> ⭐ {selectedBook.rating}</p>

                        <p>{selectedBook.description}</p>

                    </div>

                </div>

            )}

        </div>

    );

}

export default Admin;