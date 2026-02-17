from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, jwt
from auth import auth_bp
from student_routes import student_bp
from admin_routes import admin_bp
from payments import payments_bp
from receipts import receipts_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(receipts_bp)

    @app.get("/api/health")
    def health():
        return {"ok": True}

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=5000, debug=True)

