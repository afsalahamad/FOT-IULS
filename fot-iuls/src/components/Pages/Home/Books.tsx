import "./Boo.css";

function Book() {
    return (
        <div className="book" id="library">

            <img
                src="ai.jpg"
                alt="Artificial Intelligence"
                className="book-image"
            />

            <h4>Artificial Intelligence</h4>

            <p>Stuart Russell</p>

            <div className="book-rating">
                ⭐ 4.8 / 5
            </div>

        </div>
    );
}

export default Book;