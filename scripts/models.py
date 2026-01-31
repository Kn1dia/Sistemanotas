"""
Modelos de Dados para SmartSpend-BR usando SQLAlchemy
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship, declarative_base
import uuid
from datetime import datetime

# Criar Base diretamente para evitar import circular
Base = declarative_base()

class User(Base):
    """
    Tabela de Usuários
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nome = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)  # Placeholder para autenticação futura
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamento com notas
    notas = relationship("Nota", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', nome='{self.nome}')>"

class Nota(Base):
    """
    Tabela de Notas Fiscais
    """
    __tablename__ = "notas"
    
    # Mantendo String para compatibilidade com IDs atuais do frontend
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Relacionamento com usuário
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Dados básicos da nota
    mercado = Column(String, nullable=False)
    data = Column(String, nullable=False)  # Mantido como String para compatibilidade
    total = Column(Float, nullable=False)
    categoria = Column(String, nullable=False)
    
    # Dados detalhados extraídos pela IA (JSON)
    itens = Column(JSON, nullable=True)  # Lista de produtos: [{nome, qtde, valor, marca, categoria}]
    
    # Metadados
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento
    user = relationship("User", back_populates="notas")
    
    def __repr__(self):
        return f"<Nota(id='{self.id}', mercado='{self.mercado}', total={self.total}, categoria='{self.categoria}')>"
    
    def to_dict(self):
        """
        Converte o modelo para dicionário (compatível com frontend)
        """
        return {
            "id": self.id,
            "mercado": self.mercado,
            "data": self.data,
            "total": self.total,
            "categoria": self.categoria,
            "itens": self.itens or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
