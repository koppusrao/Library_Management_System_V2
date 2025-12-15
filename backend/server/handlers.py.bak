import grpc
import logging
from datetime import datetime, timedelta, date
from google.protobuf.timestamp_pb2 import Timestamp
from sqlalchemy.exc import SQLAlchemyError

import library_pb2
import library_pb2_grpc

# -----------------------------------------------------------
# Database & Models
# -----------------------------------------------------------
from database.db import SessionLocal
from models.book import Book
from models.member import Member
from models.loan import Loan

# Status constants
from constants.status import STATUS_BORROWED, STATUS_RETURNED

# -----------------------------------------------------------
# Logging
# -----------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger("grpc-backend")

# -----------------------------------------------------------
# Helpers
# -----------------------------------------------------------
def to_ts(dt):
    if not dt:
        return None
    ts = Timestamp()
    ts.FromDatetime(dt)
    return ts


def build_loan_pb(row):
    if not row:
        return library_pb2.Loan()

    loan = library_pb2.Loan(
        id=row.id,
        book_id=row.book_id,
        member_id=row.member_id,
        status=row.status or "",
        book_title=row.book_title or "",
        book_author=row.book_author or "",
        member_name=row.member_name or "",
        member_email=row.member_email or "",
    )

    for f in ["borrowed_at", "returned_at", "created_at", "updated_at"]:
        ts = to_ts(getattr(row, f, None))
        if ts:
            getattr(loan, f).CopyFrom(ts)

    if row.due_date:
        loan.due_date.year = row.due_date.year
        loan.due_date.month = row.due_date.month
        loan.due_date.day = row.due_date.day

    return loan


def db_error(session, context, err):
    try:
        session.rollback()
    except Exception:
        pass
    logger.error("DB error", {"error": str(err)})
    context.abort(grpc.StatusCode.INTERNAL, "Database error")


# -----------------------------------------------------------
# gRPC Service
# -----------------------------------------------------------
class LibraryService(library_pb2_grpc.LibraryServicer):

    # ================= BOOKS =================

    def CreateBook(self, request, context):
        with SessionLocal() as session:
            try:
                b = request.book
                total = b.copies_total or 1

                book = Book(
                    title=b.title,
                    author=b.author,
                    isbn=b.isbn,
                    published_year=b.published_year,
                    copies_total=total,
                    copies_available=total,
                )
                session.add(book)
                session.commit()
                session.refresh(book)

                return library_pb2.CreateBookResponse(
                    book=library_pb2.Book(
                        id=book.id,
                        title=book.title,
                        author=book.author,
                        isbn=book.isbn,
                        published_year=book.published_year,
                        copies_total=book.copies_total,
                        copies_available=book.copies_available,
                    )
                )
            except SQLAlchemyError as e:
                db_error(session, context, e)

    def ListBooks(self, request, context):
        with SessionLocal() as session:
            books = session.query(Book).all()
            return library_pb2.ListBooksResponse(
                books=[
                    library_pb2.Book(
                        id=b.id,
                        title=b.title,
                        author=b.author,
                        isbn=b.isbn,
                        published_year=b.published_year,
                        copies_total=b.copies_total,
                        copies_available=b.copies_available,
                    )
                    for b in books
                ]
            )

    def UpdateBook(self, request, context):
        with SessionLocal() as session:
            try:
                book = session.query(Book).get(request.id)
                if not book:
                    context.abort(grpc.StatusCode.NOT_FOUND, "Book not found")

                # Update fields if provided
                if request.title:
                    book.title = request.title
                if request.author:
                    book.author = request.author
                if request.isbn:
                    book.isbn = request.isbn
                if request.published_year:
                    book.published_year = request.published_year

                if request.copies_total:
                    borrowed_count = session.query(Loan).filter(
                        Loan.book_id == book.id,
                        Loan.status == STATUS_BORROWED
                    ).count()

                    if request.copies_total < borrowed_count:
                        context.abort(
                            grpc.StatusCode.FAILED_PRECONDITION,
                            "Total copies cannot be less than borrowed copies"
                        )

                    diff = request.copies_total - book.copies_total
                    book.copies_total = request.copies_total
                    book.copies_available = max(
                        0, (book.copies_available or 0) + diff
                    )

                book.updated_at = datetime.utcnow()
                session.commit()
                session.refresh(book)

                return library_pb2.UpdateBookResponse(
                    book=library_pb2.Book(
                        id=book.id,
                        title=book.title,
                        author=book.author,
                        isbn=book.isbn,
                        published_year=book.published_year,
                        copies_total=book.copies_total,
                        copies_available=book.copies_available,
                    )
                )
            except SQLAlchemyError as e:
                db_error(session, context, e)

    def DeleteBook(self, request, context):
        with SessionLocal() as session:
            try:
                book = session.query(Book).filter(Book.id == request.id).first()
                if not book:
                    context.abort(grpc.StatusCode.NOT_FOUND, "Book not found")

                active = session.query(Loan).filter(
                    Loan.book_id == book.id,
                    Loan.status == STATUS_BORROWED
                ).count()

                if active > 0:
                    context.abort(
                        grpc.StatusCode.FAILED_PRECONDITION,
                        "Book has active loans"
                    )

                session.delete(book)
                session.commit()
                return library_pb2.DeleteBookResponse(success=True)
            except SQLAlchemyError as e:
                db_error(session, context, e)

    # ================= MEMBERS =================

    def CreateMember(self, request, context):
        with SessionLocal() as session:
            try:
                m = request.member
                member = Member(
                    name=m.name,
                    email=m.email,
                    phone=m.phone,
                    address=m.address,
                )
                session.add(member)
                session.commit()
                session.refresh(member)

                return library_pb2.CreateMemberResponse(
                    member=library_pb2.Member(
                        id=member.id,
                        name=member.name,
                        email=member.email,
                        phone=member.phone,
                        address=member.address,
                    )
                )
            except SQLAlchemyError as e:
                db_error(session, context, e)

    def ListMembers(self, request, context):
        with SessionLocal() as session:
            members = session.query(Member).all()
            return library_pb2.ListMembersResponse(
                members=[
                    library_pb2.Member(
                        id=m.id,
                        name=m.name,
                        email=m.email,
                        phone=m.phone,
                        address=m.address,
                    )
                    for m in members
                ]
            )

    def UpdateMember(self, request, context):
        with SessionLocal() as session:
            try:
                member = session.query(Member).get(request.id)
                if not member:
                    context.abort(grpc.StatusCode.NOT_FOUND, "Member not found")

                # Update fields only if provided
                if request.name:
                    member.name = request.name

                if request.email:
                    # Email uniqueness validation
                    existing = session.query(Member).filter(
                        Member.email == request.email,
                        Member.id != member.id
                    ).first()
                    if existing:
                        context.abort(
                            grpc.StatusCode.ALREADY_EXISTS,
                            "Email already exists"
                        )
                    member.email = request.email

                if request.phone:
                    member.phone = request.phone

                if request.address:
                    member.address = request.address

                member.updated_at = datetime.utcnow()

                session.commit()
                session.refresh(member)

                return library_pb2.UpdateMemberResponse(
                    member=library_pb2.Member(
                        id=member.id,
                        name=member.name,
                        email=member.email,
                        phone=member.phone,
                        address=member.address,
                    )
                )

            except SQLAlchemyError as e:
                db_error(session, context, e)


    def DeleteMember(self, request, context):
        with SessionLocal() as session:
            try:
                member = session.query(Member).filter(Member.id == request.id).first()
                if not member:
                    context.abort(grpc.StatusCode.NOT_FOUND, "Member not found")

                active = session.query(Loan).filter(
                    Loan.member_id == member.id,
                    Loan.status == STATUS_BORROWED
                ).count()

                if active > 0:
                    context.abort(
                        grpc.StatusCode.FAILED_PRECONDITION,
                        "Member has active loans"
                    )

                session.delete(member)
                session.commit()
                return library_pb2.DeleteMemberResponse(success=True)
            except SQLAlchemyError as e:
                db_error(session, context, e)

    # ================= LOANS =================

    def BorrowBook(self, request, context):
        with SessionLocal() as session:
            try:
                book = session.query(Book).filter(Book.id == request.book_id).first()
                member = session.query(Member).filter(Member.id == request.member_id).first()

                if not book or not member:
                    context.abort(grpc.StatusCode.NOT_FOUND, "Book or Member not found")

                if book.copies_available <= 0:
                    context.abort(
                        grpc.StatusCode.FAILED_PRECONDITION,
                        "Book not available"
                    )

                now = datetime.utcnow()
                due = (
                    date(
                        request.due_date.year,
                        request.due_date.month,
                        request.due_date.day
                    )
                    if request.HasField("due_date")
                    else now.date() + timedelta(days=7)
                )

                loan = Loan(
                    book_id=book.id,
                    member_id=member.id,
                    borrowed_at=now,
                    due_date=due,
                    status=STATUS_BORROWED,
                    created_at=now,
                    updated_at=now,
                )

                book.copies_available -= 1
                session.add(loan)
                session.commit()

                row = session.query(
                    Loan.id, Loan.book_id, Loan.member_id,
                    Loan.borrowed_at, Loan.returned_at,
                    Loan.created_at, Loan.updated_at,
                    Loan.due_date, Loan.status,
                    Book.title.label("book_title"),
                    Book.author.label("book_author"),
                    Member.name.label("member_name"),
                    Member.email.label("member_email"),
                ).join(Book).join(Member).filter(
                    Loan.id == loan.id
                ).first()

                return library_pb2.BorrowResponse(
                    loan=build_loan_pb(row)
                )
            except SQLAlchemyError as e:
                db_error(session, context, e)

    def ReturnBook(self, request, context):
        with SessionLocal() as session:
            try:
                loan = session.query(Loan).filter(Loan.id == request.loan_id).first()
                if not loan:
                    context.abort(grpc.StatusCode.NOT_FOUND, "Loan not found")

                if loan.status != STATUS_BORROWED:
                    context.abort(
                        grpc.StatusCode.FAILED_PRECONDITION,
                        "Loan not borrowed"
                    )

                loan.status = STATUS_RETURNED
                loan.returned_at = datetime.utcnow()
                loan.updated_at = datetime.utcnow()

                book = session.query(Book).filter(Book.id == loan.book_id).first()
                if book:
                    book.copies_available += 1

                session.commit()

                row = session.query(
                    Loan.id, Loan.book_id, Loan.member_id,
                    Loan.borrowed_at, Loan.returned_at,
                    Loan.created_at, Loan.updated_at,
                    Loan.due_date, Loan.status,
                    Book.title.label("book_title"),
                    Book.author.label("book_author"),
                    Member.name.label("member_name"),
                    Member.email.label("member_email"),
                ).join(Book).join(Member).filter(
                    Loan.id == loan.id
                ).first()

                return library_pb2.ReturnResponse(
                    loan=build_loan_pb(row)
                )
            except SQLAlchemyError as e:
                db_error(session, context, e)

    def ListLoansForMember(self, request, context):
        with SessionLocal() as session:
            rows = session.query(
                Loan.id, Loan.book_id, Loan.member_id,
                Loan.borrowed_at, Loan.returned_at,
                Loan.created_at, Loan.updated_at,
                Loan.due_date, Loan.status,
                Book.title.label("book_title"),
                Book.author.label("book_author"),
                Member.name.label("member_name"),
                Member.email.label("member_email"),
            ).join(Book).join(Member).filter(
                Loan.member_id == request.member_id
            ).all()

            return library_pb2.ListLoansForMemberResponse(
                loans=[build_loan_pb(r) for r in rows]
            )

    def ListAllLoans(self, request, context):
        with SessionLocal() as session:
            rows = session.query(
                Loan.id, Loan.book_id, Loan.member_id,
                Loan.borrowed_at, Loan.returned_at,
                Loan.created_at, Loan.updated_at,
                Loan.due_date, Loan.status,
                Book.title.label("book_title"),
                Book.author.label("book_author"),
                Member.name.label("member_name"),
                Member.email.label("member_email"),
            ).join(Book).join(Member).all()

            return library_pb2.ListAllLoansResponse(
                loans=[build_loan_pb(r) for r in rows]
            )