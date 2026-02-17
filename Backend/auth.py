from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from extensions import db
from models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def safe_user(u: User):
    return {
        "id": u.id,
        "role": u.role,
        "student_id": u.student_id,
        "name": u.name,
        "program": u.program,
        "level": u.level,
        "phone": u.phone,
        "email": u.email,
    }

@auth_bp.post("/register")
def register_student():
    data = request.get_json() or {}
    required = ["student_id", "name", "program", "level", "password"]
    for k in required:
        if not data.get(k):
            return jsonify({"error": f"Missing {k}"}), 400

    if User.query.filter_by(student_id=data["student_id"]).first():
        return jsonify({"error": "Student ID already registered"}), 409

    u = User(
        role="STUDENT",
        student_id=data["student_id"].strip(),
        name=data["name"].strip(),
        program=data["program"].strip(),
        level=str(data["level"]).strip(),
        phone=(data.get("phone") or "").strip() or None,
        email=(data.get("email") or "").strip() or None,
    )
    u.set_password(data["password"])
    db.session.add(u)
    db.session.commit()
    return jsonify({"user": safe_user(u)}), 201

@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    identifier = (data.get("student_id") or data.get("email") or "").strip()
    password = data.get("password") or ""
    if not identifier or not password:
        return jsonify({"error": "Missing credentials"}), 400

    u = User.query.filter((User.student_id == identifier) | (User.email == identifier)).first()
    if not u or not u.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(
    identity=str(u.id),
    additional_claims={"role": u.role}
    )
    
    return jsonify({"access_token": token, "user": safe_user(u)})
