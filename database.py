from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Diretório do banco de dados
DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
os.makedirs(DB_DIR, exist_ok=True)

# URL do banco SQLite
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(DB_DIR, 'smartspend.db')}"

# Engine do SQLAlchemy
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Session local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()

def get_db():
    """
    Dependency para obter sessão do banco
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Inicializa o banco de dados criando todas as tabelas
    """
    from models import User, Nota  # Import aqui para evitar circular import
    Base.metadata.create_all(bind=engine)
    print("✅ Banco de dados inicializado!")