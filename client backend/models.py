from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

class Base(DeclarativeBase):
    pass

class Render(Base):
    __tablename__ = "items"
    userid: Mapped[str] = mapped_column(String(255))
    commanderid: Mapped[str] = mapped_column(String(255), primary_key=True)
    no_of_frames: Mapped[str] = mapped_column(String(255))
    projectName: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(100))
    def __repr__(self) -> str:
        return f"Render(userid={self.userid}, commanderid={self.commanderid}, no_of_frames={self.no_of_frames}, projectName={self.projectName}, status={self.status})"