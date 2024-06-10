import React, { useState } from "react";

const Limit = ({ setBookList }) => {
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(1);

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
      } else {
        console.error("Data fetch failed:", await response.text());
      }
    } catch (error) {
      console.error("Error during fetching:", error.message);
    } finally {
    }
  };

  const handleSelectChange = (e) => {
    setLimit(e.target.value);
  };

  return (
    <div>
      <select onChange={handleSelectChange}>
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={15}>15</option>
        <option value={20}>20</option>
      </select>
      <button onClick={() => fetchPageData(page, limit)}>submit</button>
    </div>
  );
};

export default Limit;
