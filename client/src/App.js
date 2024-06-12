import "./App.css";
import Axios from "axios";
import { useState, useEffect } from "react";
import Login from "./login.js";
import Signup from "./signup.js";
import ExcelDownloadComponent from "./dowload.js";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Logout from "./logout.js";
import ProtectedRoute from "./protectedRoute.js";
import * as xlsx from "xlsx";
import ForgetPassword from "./forgetPassword.js";
import ResetPassword from "./resetPassword.js";

function AppContent() {
  const [author, setAuthor] = useState();
  const [title, setTitle] = useState();
  const [updatedAuthor, setUpdatedAuthor] = useState();
  const [updatedTitle, setUpdatedTitle] = useState();
  const [bookList, setBookList] = useState([]);
  const [products, setProducts] = useState(bookList);
  const [searchVal, setSearchVal] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [uploadedData, setUploadedData] = useState();
  const [pageCount, setPageCount] = useState();
  const [fileName, setFileName] = useState("");
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

  const fetchBookList = async (page, limit) => {
    console.log(
      "Fetching book list with token: ",
      localStorage.getItem("token")
    );
    await Axios.get(
      `http://localhost:3001/collection?page=${page}&limit=${limit}`
    )
      .then((response) => {
        setBookList(response.data.resultCollection);
        setProducts(response.data.resultCollection);
        if (response.data.pageCount) {
          setPageCount(response.data.pageCount);
        }
      })
      .catch((error) => {
        console.error("Error fetching collection:", error);
      });
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/collection").then((res) => {
      setBookList(res.data.resultCollection);
      setProducts(res.data.resultCollection);
      if (res.data.pageCount) {
        setPageCount(res.data.pageCount);
      }
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

  async function handleSearchClick() {
    if (searchVal === "") {
      setProducts(bookList);
      return;
    }

    const filterBySearch = bookList.filter((book) => {
      return (
        book.title.toLowerCase().includes(searchVal.toLowerCase()) ||
        book.author.toLowerCase().includes(searchVal.toLowerCase())
      );
    });

    setProducts(filterBySearch);
  }

  const handleNext = () => {
    if (page < pageCount) {
      setPage((prevPage) => {
        const newPage = prevPage + 1;
        fetchBookList(newPage, limit);
        return newPage;
      });
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage((prevPage) => {
        const newPage = Math.max(prevPage - 1, 1);
        fetchBookList(newPage, limit);
        return newPage;
      });
    }
  };

  const handleSelectChange = (e) => {
    const newLimit = e.target.value;
    setLimit(newLimit);
    setPage(1); // Reset page to 1 when limit changes
    fetchBookList(1, newLimit); // Fetch the first page with the new limit
  };

  const readUploadFile = (e) => {
    e.preventDefault();
    try {
      if (e.target.files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = e.target.result;
          const workbook = xlsx.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = xlsx.utils.sheet_to_json(worksheet);
          setUploadedData(json);
        };
        reader.readAsArrayBuffer(e.target.files[0]);
        const file = e.target.files[0];
        setFileName(file.name);
      }
    } catch (e) {
      console.log({ msg: e });
    }
  };

  const addToData = async (event) => {
    event.preventDefault();
    console.log("Adding to list with token: ", localStorage.getItem("token"));

    const uploadPromises = uploadedData.map((item) =>
      Axios.post("http://localhost:3001/collection", {
        author: item.author,
        title: item.title,
      })
    );

    try {
      await Promise.all(uploadPromises);
      fetchBookList(); // Refresh the book list after adding new ones
    } catch (error) {
      console.error("Error adding to collection:", error);
    }
  };

  return token ? (
    <div className="App">
      <h1>CRUD app for Book Collection</h1>
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

      <div className="flex  flex-row items-center">
        <form className="text-xs flex items-center" onSubmit={addToData}>
          <label className="flex items-center" htmlFor="upload">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-full text-purple-700 hover:bg-purple-50 hover:text-purple-600 focus:ring ring-offset-2 ring-purple-100 focus:outline-none transition duration-150 ease-in-out"
              onClick={() => document.getElementById("upload").click()}
            >
              +
            </button>
            <span className="ml-2">{fileName || "No file chosen"}</span>
          </label>
          <input
            type="file"
            name="upload"
            id="upload"
            onChange={readUploadFile}
            className="hidden"
          />
          <button
            className="mt-2 ml-4 w-20 flex items-center justify-center px-2 py-1 text-xs font-small rounded-md text-purple-700 bg-purple-100 hover:bg-purple-50 hover:text-purple-600 focus:ring ring-offset-2 ring-purple-100 focus:outline-none transition duration-150 ease-in-out"
            type="submit"
          >
            Submit
          </button>
        </form>
        <div className="mt-10 mx-2 mb-10 max-w-xl px-3 py-0 rounded-full bg-gray-50 border flex focus-within:border-gray-300 text-xs">
          <input
            placeholder="Search book..."
            onChange={(e) => setSearchVal(e.target.value)}
            className="bg-transparent w-full focus:outline-none pr-2 font-semibold border-0 focus:ring-0 px-0 py-0 "
          ></input>
          <button
            className="flex flex-row my-1 items-center justify-center min-w-[130px text-xs px-2 rounded-full font-small tracking-wide border disabled:cursor-not-allowed disabled:opacity-50 transition ease-in-out duration-150 bg-[#3F72AF] text-white border-transparent py-1.5 h-[38px] -mr-3"
            onClick={handleSearchClick}
          >
            Search
          </button>
        </div>
        <div className="mx-0 my-0">
          <select
            className="bg-white divide-y divide-gray-100 rounded-lg shadow w-33 h-15 font-thin text-xs px-1 py-2 "
            onChange={handleSelectChange}
          >
            <option
              className="block px-4 py-1 hover:bg-gray-100 hover:text-white"
              value={1}
            >
              1 per page
            </option>
            <option
              className="block px-4 py-1 hover:bg-gray-100 hover:text-white"
              value={2}
            >
              2 per page
            </option>
            <option
              className="block px-4 py-1 hover:bg-gray-100 hover:text-white"
              value={5}
            >
              5 per page
            </option>
            <option
              className="block px-4 py-1 hover:bg-gray-100  hover:text-white"
              value={10}
            >
              10 per page
            </option>
            <option
              className="block px-4 py-1 hover:bg-gray-100  hover:text-white"
              value={15}
            >
              15 per page
            </option>
            <option
              className="block px-4 py-1 hover:bg-gray-100  hover:text-white"
              value={20}
            >
              20 per page
            </option>
          </select>
        </div>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg px-2">
        <div className="flex  flex-row items-center justify-between">
          <ExcelDownloadComponent />
          <button
            className="inline-flex items-center py-1 px-2 bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-white rounded-md transition duration-300 "
            onClick={togglePopupAdd}
          >
            Add
          </button>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-[#112D4E]">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Author
              </th>
              <th scope="col" className="px-6 py-3">
                Functionality
              </th>
            </tr>
          </thead>
          <tbody>
            {products &&
              products.length > 0 &&
              products.map((val, key) => (
                <tr
                  key={key}
                  className="bg-[#DBE2EF] border-b dark:bg-[#DBE2EF] dark:border-gray-700 "
                >
                  <td className="px-6 py-4 ">
                    <h3 className="font-bold">{val.title}</h3>
                  </td>
                  <td className="px-6 py-4">
                    <h3 className="font-bold">{val.author}</h3>
                  </td>
                  <td>
                    <>
                      <button
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-2 btn-open-popup"
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
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-2"
                      onClick={() => deleteBookList(val._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div>
          <button
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-2"
            onClick={handlePrevious}
          >
            &lt; previous
          </button>
          <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-2">
            {page}
          </button>
          <button
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline mx-2"
            onClick={handleNext}
          >
            next &gt;
          </button>
        </div>
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
        <Route path="/forgetPassword" element={<ForgetPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
