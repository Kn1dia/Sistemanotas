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

class Item(Base):
    """
    Modelo de item individual de uma nota fiscal
    (Opcional - pode ser usado se quiser separar itens em tabela própria)
    """
    __tablename__ = "itens"
    
    id = Column(Integer, primary_key=True, index=True)
    nota_id = Column(String, ForeignKey("notas.id"))
    nome = Column(String)
    valor = Column(Float)
    quantidade = Column(Integer)
    categoria = Column(String)
    
    # Relacionamento com nota
    nota = relationship("Nota")