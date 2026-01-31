"""
Configuração do Banco de Dados SQLite para SmartSpend-BR
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Caminho do banco de dados
DATABASE_URL = "sqlite:///./smartspend.db"

# Criar engine do SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Necessário para SQLite
)

# Sessão do banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency para obter sessão do banco de dados
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
    # Importar modelos aqui para evitar import circular
    from models import Base, User, Nota
    
    # Criar tabelas primeiro
    Base.metadata.create_all(bind=engine)
    print("📋 Tabelas criadas com sucesso")
    
    # Criar usuário padrão se não existir
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            default_user = User(
                id=1,
                email="user@smartspend.com",
                nome="Usuário Padrão",
                password_hash="placeholder"
            )
            db.add(default_user)
            db.commit()
            print("✅ Usuário padrão criado")
        else:
            print("👤 Usuário padrão já existe")
    except Exception as e:
        print(f"❌ Erro ao criar usuário padrão: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    print("🗄️ Banco de dados inicializado com sucesso!")
