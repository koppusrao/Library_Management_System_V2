import React, { useState } from "react";

// ===== Existing Components (UNCHANGED) =====
import AddBook from "./components/AddBook";
import AddMember from "./components/AddMember";
import BorrowBook from "./components/BorrowBook";
import ReturnBook from "./components/ReturnBook";
import ListBooks from "./components/ListBooks";
import ListMembers from "./components/ListMembers";
import MemberBorrowReport from "./components/MemberBorrowReport";
import BookWiseBorrowReport from "./components/BookWiseBorrowReport";
import OverdueReturnReport from "./components/OverdueReturnReport";
import AvailableBooks from "./components/AvailableBooks";

// ===== Edit / Delete Screens =====
import EditBook from "./components/EditBook";
import DeleteBook from "./components/DeleteBook";
import EditMember from "./components/EditMember";
import DeleteMember from "./components/DeleteMember";

import "./Dashboard.css";
import libraryIcon from "./assets/books.jpeg";

function Dashboard() {
  const [activePage, setActivePage] = useState("home");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showReports, setShowReports] = useState(false);

  const renderPage = () => {
    switch (activePage) {

      // ===== ADD =====
      case "addBook":
        return <AddBook />;
      case "addMember":
        return <AddMember />;

      // ===== EDIT / DELETE =====
      case "editBook":
        return <EditBook />;
      case "deleteBook":
        return <DeleteBook />;
      case "editMember":
        return <EditMember />;
      case "deleteMember":
        return <DeleteMember />;

      // ===== LOANS =====
      case "borrowBook":
        return <BorrowBook />;
      case "returnBook":
        return <ReturnBook />;

      // ===== REPORTS =====
      case "memberReport":
        return <MemberBorrowReport />;
      case "availableBooks":
        return <AvailableBooks />;
      case "overdueReport":
        return <OverdueReturnReport />;
      case "bookReport":
        return <BookWiseBorrowReport />;

      default:
        return (
          <div className="placeholder-text">
            Please select an option from the menu.
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">

      {/* ================= HEADER ================= */}
      <div className="dashboard-header">
        <img src={libraryIcon} className="header-icon" alt="Library Icon" />
        <span className="header-title">
          Neighborhood Library Management System
        </span>
      </div>

      <div className="dashboard-body">

        {/* ================= LEFT MENU ================= */}
        <div className="left-menu">

          {/* ===== ADD MENU ===== */}
          <div
            className="menu-item dropdown"
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            Add ▼
          </div>

          {showAddMenu && (
            <div className="dropdown-items">

              <div
                className="submenu-item"
                onClick={() => setActivePage("addBook")}
              >
                Book (Add)
              </div>

              <div
                className="submenu-item"
                onClick={() => setActivePage("addMember")}
              >
                Member (Add)
              </div>

              <div
                className="submenu-item"
                onClick={() => setActivePage("editBook")}
              >
                Book Edit
              </div>

              <div
                className="submenu-item"
                onClick={() => setActivePage("deleteBook")}
              >
                Book Delete
              </div>

              <div
                className="submenu-item"
                onClick={() => setActivePage("editMember")}
              >
                Member Edit
              </div>

              <div
                className="submenu-item"
                onClick={() => setActivePage("deleteMember")}
              >
                Member Delete
              </div>
            </div>
          )}

          {/* ===== LOANS ===== */}
          <div
            className="menu-item"
            onClick={() => setActivePage("borrowBook")}
          >
            Borrow Book
          </div>

          <div
            className="menu-item"
            onClick={() => setActivePage("returnBook")}
          >
            Return Book
          </div>

          {/* ===== REPORTS ===== */}
          <div
            className="menu-item dropdown"
            onClick={() => setShowReports(!showReports)}
          >
            Reports ▼
          </div>

          {showReports && (
            <div className="dropdown-items">
              <div
                className="submenu-item"
                onClick={() => setActivePage("memberReport")}
              >
                Member Book Borrow Report
              </div>

              <div
                className="submenu-item"
                onClick={() => setActivePage("availableBooks")}
              >
                Available Book List
              </div>

              <div
                className="submenu-item"
                onClick={() => setActivePage("overdueReport")}
              >
                Overdue Return Report
              </div>

              <div
                className="submenu-item"
                onClick={() => setActivePage("bookReport")}
              >
                Book-wise Borrowers Report
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="right-panel">
          {renderPage()}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;