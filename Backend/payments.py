import secrets
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from extensions import db
from models import AssignedDue, Payment

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")

def gen_reference(prefix="DUE"):
    return f"{prefix}-{secrets.token_hex(6).upper()}"

@payments_bp.post("/init")
@jwt_required()
def init_payment():
    """
    Student selects an AssignedDue and starts payment.
    In production: call Flutterwave/Paystack to charge, then handle webhook to mark success.
    """
    user_id = int(get_jwt_identity())
    role = get_jwt().get("role")
    if role != "STUDENT":
        return jsonify({"error": "Students only"}), 403


    data = request.get_json() or {}
    assigned_due_id = data.get("assigned_due_id")
    method = data.get("method")  # MTN_MOMO, VODAFONE_CASH, AIRTELTIGO, CARD
    if not assigned_due_id or not method:
        return jsonify({"error": "assigned_due_id and method required"}), 400

    ad = AssignedDue.query.get(int(assigned_due_id))
    if not ad or ad.student_user_id != user_id:
        return jsonify({"error": "Due not found"}), 404
    if ad.status == "PAID":
        return jsonify({"error": "Already paid"}), 409

    ref = gen_reference()
    p = Payment(
        student_user_id=user_id,
        assigned_due_id=ad.id,
        amount=ad.due.amount,
        method=method,
        reference=ref,
        status="PENDING",
    )
    db.session.add(p)
    db.session.commit()

    # TODO: integrate with Flutterwave/Paystack here, return checkout URL or USSD prompt info.
    return jsonify({
        "payment": {
            "id": p.id,
            "reference": p.reference,
            "amount": p.amount,
            "method": p.method,
            "status": p.status,
        },
        "next_step": "SIMULATED_SUCCESS"
    }), 201

@payments_bp.post("/simulate-success/<reference>")
@jwt_required()
def simulate_success(reference: str):
    """
    DEV ONLY: mark pending payment as success.
    In real life: webhook verifies transaction and updates DB.
    """
    me = get_jwt_identity()
    p = Payment.query.filter_by(reference=reference).first()
    if not p or p.student_user_id != me["id"]:
        return jsonify({"error": "Payment not found"}), 404
    if p.status == "SUCCESS":
        return jsonify({"ok": True})

    p.status = "SUCCESS"
    p.assigned_due.status = "PAID"
    db.session.commit()
    return jsonify({"ok": True, "reference": reference})
