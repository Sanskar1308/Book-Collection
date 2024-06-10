import React, { useState } from "react";

const Paginate = ({ setBookList }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [pageCount, setPageCount] = useState(1);

  const fetchPageData = async (page, limit) => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/collection?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send token in the authorization header
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookList(data.resultCollection);
        setPageCount(data.pageCount);
        console.log(data);
      } else {
        console.error("Data fetch failed:", await response.text());
      }
    } catch (error) {
      console.error("Error during fetching:", error.message);
    } finally {
    }
  };

  const handleNext = () => {
    setPage((prevPage) => {
      const newPage = prevPage + 1;
      fetchPageData(newPage, limit);
      return newPage;
    });
  };

  const handlePrevious = () => {
    setPage((prevPage) => {
      const newPage = Math.max(prevPage - 1, 1);
      fetchPageData(newPage, limit);
      return newPage;
    });
  };

  const handleSelectChange = (e) => {
    setLimit(e.target.value);
  };

  return (
    <div>
      <button onClick={handlePrevious}>&lt; previous</button>
      {/* <input type="text" onChange={(e) => setLimit(e.target.value)} />
       */}
      {/* <select onChange={handleSelectChange}>
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={15}>15</option>
        <option value={20}>20</option>
      </select>
      <button onClick={() => fetchPageData(page, limit)}>submit</button> */}
      <button>{page}</button>
      <button onClick={handleNext}>next &gt;</button>
    </div>
  );
};

export default Paginate;
