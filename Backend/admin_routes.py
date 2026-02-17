from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models import User, Due, AssignedDue, Payment

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def require_admin(role: str, allowed=("SUPER_ADMIN", "TREASURER", "VIEWER")) -> bool:
    return role in allowed


@admin_bp.post("/dues")
@jwt_required()
def create_due():
    user_id = int(get_jwt_identity())
    role = (get_jwt().get("role") or "").strip()

    if not require_admin(role, allowed=("SUPER_ADMIN", "TREASURER")):
        return jsonify({"error": "Not allowed"}), 403

    data = request.get_json() or {}
    required = ["title", "due_type", "amount"]
    for k in required:
        if not data.get(k):
            return jsonify({"error": f"Missing {k}"}), 400

    deadline = data.get("deadline")
    d = Due(
        title=data["title"].strip(),
        due_type=data["due_type"].strip(),
        amount=int(data["amount"]),
        deadline=datetime.fromisoformat(deadline).date() if deadline else None,
        target_program=(data.get("target_program") or None),
        target_level=(str(data.get("target_level")).strip() if data.get("target_level") else None),
        active=True,
    )
    db.session.add(d)
    db.session.commit()

    # Assign automatically to matching students
    students_q = User.query.filter_by(role="STUDENT")
    if d.target_program:
        students_q = students_q.filter_by(program=d.target_program)
    if d.target_level:
        students_q = students_q.filter_by(level=str(d.target_level))

    created = 0
    for s in students_q.all():
        db.session.add(AssignedDue(due_id=d.id, student_user_id=s.id))
        created += 1
    db.session.commit()

    return jsonify({"due_id": d.id, "assigned_count": created}), 201


@admin_bp.get("/students")
@jwt_required()
def list_students():
    role = (get_jwt().get("role") or "").strip()
    if not require_admin(role):
        return jsonify({"error": "Not allowed"}), 403

    students = User.query.filter_by(role="STUDENT").order_by(User.created_at.desc()).all()
    return jsonify({
        "students": [
            {
                "id": s.id,
                "student_id": s.student_id,
                "name": s.name,
                "program": s.program,
                "level": s.level,
                "phone": s.phone,
                "email": s.email,
            }
            for s in students
        ]
    })


@admin_bp.get("/payments")
@jwt_required()
def all_payments():
    role = (get_jwt().get("role") or "").strip()
    if not require_admin(role):
        return jsonify({"error": "Not allowed"}), 403

    payments = Payment.query.order_by(Payment.created_at.desc()).limit(300).all()
    return jsonify({
        "payments": [
            {
                "id": p.id,
                "reference": p.reference,
                "amount": p.amount,
                "method": p.method,
                "status": p.status,
                "date": p.created_at.isoformat(),
                "student": {"student_id": p.student.student_id, "name": p.student.name},
                "due_title": p.assigned_due.due.title,
            }
            for p in payments
        ]
    })


@admin_bp.post("/payments/verify/<reference>")
@jwt_required()
def verify_payment(reference: str):
    admin_id = int(get_jwt_identity())
    role = (get_jwt().get("role") or "").strip()

    if not require_admin(role, allowed=("SUPER_ADMIN", "TREASURER")):
        return jsonify({"error": "Not allowed"}), 403

    p = Payment.query.filter_by(reference=reference).first()
    if not p:
        return jsonify({"error": "Payment not found"}), 404

    if p.status != "SUCCESS":
        return jsonify({"error": "Payment must be SUCCESS to verify"}), 400

    p.verified_by_admin_id = admin_id
    p.verified_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"ok": True, "reference": reference})


@admin_bp.get("/reports/summary")
@jwt_required()
def report_summary():
    role = (get_jwt().get("role") or "").strip()
    if not require_admin(role):
        return jsonify({"error": "Not allowed"}), 403

    total_success = (
        db.session.query(db.func.sum(Payment.amount))
        .filter(Payment.status == "SUCCESS")
        .scalar()
        or 0
    )

    total_students = User.query.filter_by(role="STUDENT").count()

    paid_students = (
        db.session.query(Payment.student_user_id)
        .filter(Payment.status == "SUCCESS")
        .distinct()
        .count()
    )

    return jsonify({
        "total_collections": int(total_success),
        "students_total": int(total_students),
        "students_paid": int(paid_students),
        "students_pending": int(max(total_students - paid_students, 0)),
    })
