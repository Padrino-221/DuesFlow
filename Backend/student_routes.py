from datetime import date
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import AssignedDue, Payment
from extensions import db

student_bp = Blueprint("student", __name__, url_prefix="/api/student")

@student_bp.get("/dashboard")
@jwt_required()
def dashboard():
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")
    if role != "STUDENT":
        return jsonify({"error": "Students only"}), 403

    dues = AssignedDue.query.filter_by(student_user_id=user_id).all()
    total_owed = sum(d.due.amount for d in dues if d.status != "PAID")
    breakdown = {}
    now = date.today()

    due_items = []
    for d in dues:
        if d.status != "PAID" and d.due.deadline and d.due.deadline < now:
            d.status = "OVERDUE"
        breakdown[d.due.due_type] = breakdown.get(d.due.due_type, 0) + (0 if d.status == "PAID" else d.due.amount)

        due_items.append({
            "assigned_due_id": d.id,
            "due_id": d.due.id,
            "title": d.due.title,
            "type": d.due.due_type,
            "amount": d.due.amount,
            "deadline": d.due.deadline.isoformat() if d.due.deadline else None,
            "status": d.status,
        })

    db.session.commit()
    return jsonify({
        "total_owed": total_owed,
        "breakdown": breakdown,
        "dues": sorted(due_items, key=lambda x: (x["status"], x["deadline"] or "9999-12-31"))
    })

@student_bp.get("/payments")
@jwt_required()
def payment_history():
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")
    if role != "STUDENT":
        return jsonify({"error": "Students only"}), 403

    q = Payment.query.filter_by(student_user_id=user_id).order_by(Payment.created_at.desc())
    items = []
    for p in q.all():
        items.append({
            "id": p.id,
            "reference": p.reference,
            "amount": p.amount,
            "method": p.method,
            "status": p.status,
            "date": p.created_at.isoformat(),
            "due_title": p.assigned_due.due.title,
        })
    return jsonify({"payments": items})
