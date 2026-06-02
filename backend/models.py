"""SQLAlchemy ORM models — Approach CRM."""

import uuid
from datetime import date, datetime, timedelta
from sqlalchemy import (
    Column, String, Text, Date, DateTime, ForeignKey, Enum as SAEnum, Index
)
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()


class OutreachStageEnum(str, enum.Enum):
    INITIAL_PITCH        = "INITIAL_PITCH"
    FOLLOW_UP_1          = "FOLLOW_UP_1"
    FOLLOW_UP_2          = "FOLLOW_UP_2"
    TECHNICAL_ASSESSMENT = "TECHNICAL_ASSESSMENT"
    INTERVIEW_ROUND      = "INTERVIEW_ROUND"
    OFFER                = "OFFER"
    REJECTED             = "REJECTED"
    GHOSTED              = "GHOSTED"


class ApplicationStatusEnum(str, enum.Enum):
    PENDING             = "PENDING"
    AWAITING_ACTION     = "AWAITING_ACTION"
    ACTIVE_INTERVIEWING = "ACTIVE_INTERVIEWING"
    CLOSED              = "CLOSED"


class ContactChannelEnum(str, enum.Enum):
    LINKEDIN_DIRECT = "LINKEDIN_DIRECT"
    COLD_EMAIL      = "COLD_EMAIL"
    TWITTER_X       = "TWITTER_X"
    INBOUND         = "INBOUND"
    REFERRAL        = "REFERRAL"


FOLLOWUP_OFFSETS: dict[OutreachStageEnum, int] = {
    OutreachStageEnum.INITIAL_PITCH:        3,
    OutreachStageEnum.FOLLOW_UP_1:          5,
    OutreachStageEnum.FOLLOW_UP_2:          7,
    OutreachStageEnum.TECHNICAL_ASSESSMENT: 4,
}


def _gen_uuid() -> str:
    return str(uuid.uuid4())


class ApplicationModel(Base):
    __tablename__ = "applications"

    id                  = Column(String, primary_key=True, default=_gen_uuid)
    user_id             = Column(String(255), nullable=False, index=True)  # Google sub/email
    company_name        = Column(String(100), nullable=False)
    role_title          = Column(String(100), nullable=False)
    job_description_url = Column(Text, nullable=True)
    stage               = Column(SAEnum(OutreachStageEnum), nullable=False,
                                 default=OutreachStageEnum.INITIAL_PITCH)
    status              = Column(SAEnum(ApplicationStatusEnum), nullable=False,
                                 default=ApplicationStatusEnum.PENDING)
    channel             = Column(SAEnum(ContactChannelEnum), nullable=False)
    last_contact_date   = Column(Date, nullable=False, default=date.today)
    next_followup_date  = Column(Date, nullable=True)
    resume_bucket_path  = Column(Text, nullable=True)
    notes               = Column(Text, nullable=True)
    created_at          = Column(DateTime, default=datetime.utcnow)

    contacts = relationship("ContactModel", back_populates="application",
                            cascade="all, delete-orphan")

    def recalculate_followup(self):
        offset = FOLLOWUP_OFFSETS.get(self.stage)
        if offset and self.last_contact_date:
            self.next_followup_date = self.last_contact_date + timedelta(days=offset)
        else:
            self.next_followup_date = None


class ContactModel(Base):
    __tablename__ = "contacts"

    id              = Column(String, primary_key=True, default=_gen_uuid)
    application_id  = Column(String, ForeignKey("applications.id", ondelete="CASCADE"),
                             nullable=False)
    contact_name    = Column(String(100), nullable=False)
    designation     = Column(String(100), nullable=True)
    email_address   = Column(String(255), nullable=True)
    linkedin_url    = Column(Text, nullable=True)
    notes           = Column(Text, nullable=True)
    created_at      = Column(DateTime, default=datetime.utcnow)

    application = relationship("ApplicationModel", back_populates="contacts")
