import React from "react";
import ListBooks from "./components/ListBooks";
import AddBook from "./components/AddBook";
import BorrowBook from "./components/BorrowBook";
import ReturnBook from "./components/ReturnBook";
import AddMember from "./components/AddMember";

function PlainUI() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Neighborhood Library System – Plain UI</h1>

      <AddBook />
      <hr />

      <AddMember />
      <hr />

      <BorrowBook />
      <hr />

      <ReturnBook />
      <hr />

      <ListBooks />
    </div>
  );
}

export default PlainUI;