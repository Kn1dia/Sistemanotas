from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    """
    Modelo de usuário
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nome = Column(String)
    password_hash = Column(String)
    
    # Relacionamento com notas
    notas = relationship("Nota", back_populates="user")

class Nota(Base):
    """
    Modelo de nota fiscal
    """
    __tablename__ = "notas"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mercado = Column(String)
    data = Column(String)  # Formato: DD/MM/YYYY
    total = Column(Float)
    categoria = Column(String)
    itens = Column(Text)  # JSON serializado dos itens
    
    # Relacionamento com usuário
    user = relationship("User", back_populates="notas")