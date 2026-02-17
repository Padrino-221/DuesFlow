from app import create_app
from extensions import db
from models import User

app = create_app()

with app.app_context():
    if not User.query.filter_by(role="SUPER_ADMIN").first():
        admin = User(role="SUPER_ADMIN", name="System Admin", email="admin@dept.local")
        admin.set_password("Admin1234")
        db.session.add(admin)
        db.session.commit()
        print("Created SUPER_ADMIN: admin@dept.local / Admin1234")
    else:
        print("Admin already exists.")
