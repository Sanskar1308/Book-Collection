import "./App.css";
import Axios from "axios";
import { useState, useEffect } from "react";
import Login from "./login.js";
import Signup from "./signup.js";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Logout from "./logout.js";
import Paginate from "./paginated.js";
import Limit from "./limit.js";

function AppContent() {
  const [author, setAuthor] = useState();
  const [title, setTitle] = useState();
  const [updatedAuthor, setUpdatedAuthor] = useState();
  const [updatedTitle, setUpdatedTitle] = useState();
  const [bookList, setBookList] = useState([]);

  const token = localStorage.getItem("token");

  // Set up Axios to include the token in all requests
  Axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const addToList = (event) => {
    event.preventDefault();
    console.log("Adding to list with token: ", localStorage.getItem("token"));
    Axios.post("http://localhost:3001/collection", {
      author: author,
      title: title,
    })
      .then((response) => {
        console.log(response.data);
        fetchBookList(); // Refresh the book list after adding a new one
      })
      .catch((error) => {
        console.error("Error adding to collection:", error);
      });
  };

  const fetchBookList = () => {
    console.log(
      "Fetching book list with token: ",
      localStorage.getItem("token")
    );
    Axios.get("http://localhost:3001/collection")
      .then((response) => {
        setBookList(response.data.resultCollection);
      })
      .catch((error) => {
        console.error("Error fetching collection:", error);
      });
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/collection").then((res) => {
      setBookList(res.data.resultCollection);
    });
  }, []);

  const updateBookList = (id, event) => {
    event.preventDefault();
    console.log(
      "Updating book list with token: ",
      localStorage.getItem("token")
    );
    Axios.put(`http://localhost:3001/collection/${id}`, {
      title: updatedTitle,
      author: updatedAuthor,
    })
      .then((response) => {
        console.log(response.data);
        fetchBookList(); // Refresh the book list after updating
      })
      .catch((error) => {
        console.error("Error updating collection:", error);
      });
  };

  const deleteBookList = (id) => {
    console.log(
      "Deleting from book list with token: ",
      localStorage.getItem("token")
    );
    Axios.delete(`http://localhost:3001/collection/${id}`)
      .then((response) => {
        console.log(response.data);
        fetchBookList(); // Refresh the book list after deleting
      })
      .catch((error) => {
        console.error("Error deleting from collection:", error);
      });
  };

  function togglePopup() {
    const overlay = document.getElementById("popupOverlay");
    overlay.classList.toggle("show");
  }

  function togglePopupAdd() {
    const overlay = document.getElementById("popupOverlayAdd");
    overlay.classList.toggle("show");
  }

  return token ? (
    <div className="App">
      <h1>CRUD app for Book Collection</h1>
      <button className="btn btn-1" onClick={togglePopupAdd}>
        Add
      </button>
      <Logout />
      <div className="overlay-container" id="popupOverlayAdd">
        <div className="update-form popup-box">
          <h3>Add form</h3>
          <form className="form-container" onSubmit={addToList}>
            <label className="form-label">Title:</label>
            <input
              type="text"
              placeholder="Title..."
              onChange={(e) => setTitle(e.target.value)}
            />
            <label className="form-label">Author:</label>
            <input
              type="text"
              placeholder="Author..."
              onChange={(e) => setAuthor(e.target.value)}
            />
            <button className="btn btn-3" type="submit">
              Submit
            </button>
          </form>
          <button className="btn btn-2" onClick={togglePopupAdd}>
            close
          </button>
        </div>
      </div>

      <h2>List of Books</h2>
      <Limit setBookList={setBookList} />
      <div className="table-collection">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Functionality</th>
            </tr>
          </thead>
          <tbody>
            {bookList &&
              bookList.length > 0 &&
              bookList.map((val, key) => (
                <tr key={key}>
                  <td>
                    <h3>{val.title}</h3>
                  </td>
                  <td>
                    <h3>{val.author}</h3>
                  </td>
                  <td>
                    <>
                      <button
                        className="btn btn-4 btn-open-popup"
                        onClick={togglePopup}
                      >
                        Update
                      </button>
                      <div className="overlay-container" id="popupOverlay">
                        <div className="update-form popup-box">
                          <h3>Update form</h3>
                          <form
                            className="form-container"
                            onSubmit={(event) => updateBookList(val._id, event)}
                          >
                            <label className="form-label">Title:</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Update title..."
                              onChange={(e) => setUpdatedTitle(e.target.value)}
                            />
                            <label className="form-label">Author:</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Update author..."
                              onChange={(e) => setUpdatedAuthor(e.target.value)}
                            />
                            <button className="btn btn-3" type="submit">
                              Submit
                            </button>
                          </form>
                          <button className="btn btn-2" onClick={togglePopup}>
                            close
                          </button>
                        </div>
                      </div>
                    </>
                    <button
                      className="btn btn-2"
                      onClick={() => deleteBookList(val._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Paginate setBookList={setBookList} />
      </div>
    </div>
  ) : (
    <Navigate to="/login" />
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
