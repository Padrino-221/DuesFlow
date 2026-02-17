from datetime import datetime, date
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(20), nullable=False)  # STUDENT, SUPER_ADMIN, TREASURER, VIEWER
    student_id = db.Column(db.String(40), unique=True, nullable=True)  # for students
    name = db.Column(db.String(120), nullable=False)
    program = db.Column(db.String(120), nullable=True)
    level = db.Column(db.String(50), nullable=True)   # Year/Level
    phone = db.Column(db.String(30), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, pw: str):
        self.password_hash = generate_password_hash(pw)

    def check_password(self, pw: str) -> bool:
        return check_password_hash(self.password_hash, pw)


class Due(db.Model):
    __tablename__ = "dues"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)          # e.g., Semester 1 Dept Dues
    due_type = db.Column(db.String(80), nullable=False)        # departmental/event/project
    amount = db.Column(db.Integer, nullable=False)             # store as pesewas? keep int
    deadline = db.Column(db.Date, nullable=True)
    target_program = db.Column(db.String(120), nullable=True)  # null => all programs
    target_level = db.Column(db.String(50), nullable=True)     # null => all levels
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class AssignedDue(db.Model):
    """
    Links a Due to a specific student (created automatically when admin assigns dues).
    """
    __tablename__ = "assigned_dues"
    id = db.Column(db.Integer, primary_key=True)
    due_id = db.Column(db.Integer, db.ForeignKey("dues.id"), nullable=False)
    student_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    status = db.Column(db.String(20), default="PENDING")  # PENDING, PAID, OVERDUE
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    due = db.relationship("Due")
    student = db.relationship("User")


class Payment(db.Model):
    __tablename__ = "payments"
    id = db.Column(db.Integer, primary_key=True)
    student_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    assigned_due_id = db.Column(db.Integer, db.ForeignKey("assigned_dues.id"), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    method = db.Column(db.String(40), nullable=False)  # MTN_MOMO, VODAFONE_CASH, AIRTELTIGO, CARD
    reference = db.Column(db.String(120), unique=True, nullable=False)
    status = db.Column(db.String(20), default="PENDING")  # PENDING, SUCCESS, FAILED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    verified_by_admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    verified_at = db.Column(db.DateTime, nullable=True)

    student = db.relationship("User", foreign_keys=[student_user_id])
    assigned_due = db.relationship("AssignedDue")
