"""Strawberry GraphQL schema — Approach CRM (per-user data isolation)."""

from __future__ import annotations
import uuid
from datetime import date, datetime
from typing import Optional, List
import strawberry
from sqlalchemy.orm import Session

from models import (
    ApplicationModel, ContactModel,
    OutreachStageEnum, ApplicationStatusEnum, ContactChannelEnum,
)


OutreachStage     = strawberry.enum(OutreachStageEnum, name="OutreachStage")
ApplicationStatus = strawberry.enum(ApplicationStatusEnum, name="ApplicationStatus")
ContactChannel    = strawberry.enum(ContactChannelEnum, name="ContactChannel")


@strawberry.type
class ContactType:
    id:             str
    application_id: str
    contact_name:   str
    designation:    Optional[str]
    email_address:  Optional[str]
    linkedin_url:   Optional[str]
    notes:          Optional[str]

    @staticmethod
    def from_model(m: ContactModel) -> "ContactType":
        return ContactType(
            id=m.id, application_id=m.application_id,
            contact_name=m.contact_name, designation=m.designation,
            email_address=m.email_address, linkedin_url=m.linkedin_url,
            notes=m.notes,
        )


@strawberry.type
class ApplicationType:
    id:                  str
    company_name:        str
    role_title:          str
    job_description_url: Optional[str]
    stage:               OutreachStageEnum
    status:              ApplicationStatusEnum
    channel:             ContactChannelEnum
    last_contact_date:   str
    next_followup_date:  Optional[str]
    resume_bucket_path:  Optional[str]
    notes:               Optional[str]
    contacts:            List[ContactType]
    created_at:          str

    @staticmethod
    def from_model(m: ApplicationModel) -> "ApplicationType":
        return ApplicationType(
            id=m.id,
            company_name=m.company_name,
            role_title=m.role_title,
            job_description_url=m.job_description_url,
            stage=m.stage,
            status=m.status,
            channel=m.channel,
            last_contact_date=str(m.last_contact_date),
            next_followup_date=str(m.next_followup_date) if m.next_followup_date else None,
            resume_bucket_path=m.resume_bucket_path,
            notes=m.notes,
            contacts=[ContactType.from_model(c) for c in (m.contacts or [])],
            created_at=m.created_at.isoformat() if m.created_at else "",
        )


@strawberry.type
class StageStat:
    stage: str
    count: int


@strawberry.type
class DashboardMetrics:
    total:               int
    active_interviewing: int
    ghosted:             int
    offers:              int
    due_today_count:     int
    overdue_count:       int
    response_rate:       float
    stage_breakdown:     List[StageStat]


@strawberry.input
class ApplicationInput:
    company_name:        str
    role_title:          str
    stage:               OutreachStageEnum
    status:              ApplicationStatusEnum
    channel:             ContactChannelEnum
    last_contact_date:   str
    job_description_url: Optional[str] = None
    notes:               Optional[str] = None


@strawberry.input
class ContactInput:
    application_id: str
    contact_name:   str
    designation:    Optional[str] = None
    email_address:  Optional[str] = None
    linkedin_url:   Optional[str] = None
    notes:          Optional[str] = None


def get_db(info: strawberry.types.Info) -> Session:
    return info.context["db"]

def get_user_id(info: strawberry.types.Info) -> str:
    return info.context.get("user_id", "anonymous")


@strawberry.type
class Query:
    @strawberry.field
    def applications(self, info: strawberry.types.Info) -> List[ApplicationType]:
        db = get_db(info)
        user_id = get_user_id(info)
        rows = (
            db.query(ApplicationModel)
            .filter(ApplicationModel.user_id == user_id)
            .order_by(ApplicationModel.created_at.desc())
            .all()
        )
        return [ApplicationType.from_model(r) for r in rows]

    @strawberry.field
    def application(self, info: strawberry.types.Info, id: str) -> Optional[ApplicationType]:
        db = get_db(info)
        user_id = get_user_id(info)
        m = (
            db.query(ApplicationModel)
            .filter(ApplicationModel.id == id, ApplicationModel.user_id == user_id)
            .first()
        )
        return ApplicationType.from_model(m) if m else None

    @strawberry.field
    def dashboard_metrics(self, info: strawberry.types.Info) -> DashboardMetrics:
        db = get_db(info)
        user_id = get_user_id(info)
        apps = db.query(ApplicationModel).filter(ApplicationModel.user_id == user_id).all()
        today = date.today()

        total = len(apps)
        active_interviewing = sum(1 for a in apps if a.status == ApplicationStatusEnum.ACTIVE_INTERVIEWING)
        ghosted   = sum(1 for a in apps if a.stage == OutreachStageEnum.GHOSTED)
        offers    = sum(1 for a in apps if a.stage == OutreachStageEnum.OFFER)
        due_today = sum(1 for a in apps if a.next_followup_date == today)
        overdue   = sum(1 for a in apps if a.next_followup_date and a.next_followup_date < today)

        closed_positive = sum(
            1 for a in apps
            if a.stage in (OutreachStageEnum.INTERVIEW_ROUND, OutreachStageEnum.OFFER,
                           OutreachStageEnum.TECHNICAL_ASSESSMENT)
        )
        response_rate = round((closed_positive / total * 100), 1) if total else 0.0

        stage_counts: dict[str, int] = {}
        for a in apps:
            stage_counts[a.stage.value] = stage_counts.get(a.stage.value, 0) + 1

        return DashboardMetrics(
            total=total,
            active_interviewing=active_interviewing,
            ghosted=ghosted,
            offers=offers,
            due_today_count=due_today,
            overdue_count=overdue,
            response_rate=response_rate,
            stage_breakdown=[StageStat(stage=k, count=v) for k, v in stage_counts.items()],
        )


@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_application(self, info: strawberry.types.Info, input: ApplicationInput) -> ApplicationType:
        db = get_db(info)
        user_id = get_user_id(info)
        lcd = date.fromisoformat(input.last_contact_date)
        m = ApplicationModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            company_name=input.company_name,
            role_title=input.role_title,
            job_description_url=input.job_description_url,
            stage=input.stage,
            status=input.status,
            channel=input.channel,
            last_contact_date=lcd,
            notes=input.notes,
            created_at=datetime.utcnow(),
        )
        m.recalculate_followup()
        db.add(m)
        db.commit()
        db.refresh(m)
        return ApplicationType.from_model(m)

    @strawberry.mutation
    def update_application(self, info: strawberry.types.Info, id: str, input: ApplicationInput) -> ApplicationType:
        db = get_db(info)
        user_id = get_user_id(info)
        m = db.query(ApplicationModel).filter(
            ApplicationModel.id == id, ApplicationModel.user_id == user_id
        ).first()
        if not m:
            raise ValueError(f"Application {id} not found")
        m.company_name        = input.company_name
        m.role_title          = input.role_title
        m.job_description_url = input.job_description_url
        m.stage               = input.stage
        m.status              = input.status
        m.channel             = input.channel
        m.last_contact_date   = date.fromisoformat(input.last_contact_date)
        m.notes               = input.notes
        m.recalculate_followup()
        db.commit()
        db.refresh(m)
        return ApplicationType.from_model(m)

    @strawberry.mutation
    def delete_application(self, info: strawberry.types.Info, id: str) -> bool:
        db = get_db(info)
        user_id = get_user_id(info)
        m = db.query(ApplicationModel).filter(
            ApplicationModel.id == id, ApplicationModel.user_id == user_id
        ).first()
        if not m:
            return False
        db.delete(m)
        db.commit()
        return True

    @strawberry.mutation
    def create_contact(self, info: strawberry.types.Info, input: ContactInput) -> ContactType:
        db = get_db(info)
        c = ContactModel(
            id=str(uuid.uuid4()),
            application_id=input.application_id,
            contact_name=input.contact_name,
            designation=input.designation,
            email_address=input.email_address,
            linkedin_url=input.linkedin_url,
            notes=input.notes,
            created_at=datetime.utcnow(),
        )
        db.add(c)
        db.commit()
        db.refresh(c)
        return ContactType.from_model(c)

    @strawberry.mutation
    def update_contact(self, info: strawberry.types.Info, id: str, input: ContactInput) -> ContactType:
        db = get_db(info)
        c = db.query(ContactModel).filter(ContactModel.id == id).first()
        if not c:
            raise ValueError(f"Contact {id} not found")
        c.contact_name  = input.contact_name
        c.designation   = input.designation
        c.email_address = input.email_address
        c.linkedin_url  = input.linkedin_url
        c.notes         = input.notes
        db.commit()
        db.refresh(c)
        return ContactType.from_model(c)

    @strawberry.mutation
    def delete_contact(self, info: strawberry.types.Info, id: str) -> bool:
        db = get_db(info)
        c = db.query(ContactModel).filter(ContactModel.id == id).first()
        if not c:
            return False
        db.delete(c)
        db.commit()
        return True


schema = strawberry.Schema(query=Query, mutation=Mutation)
