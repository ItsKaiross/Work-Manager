# app/models/user.py
hashed_password = Column(String(255), nullable=True)
auth_provider = Column(String(50), default="local")  # "local" or "google"