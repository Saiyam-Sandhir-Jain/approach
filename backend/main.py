"""FastAPI REST entry point — Approach CRM."""

from __future__ import annotations

import os
import uuid
from contextlib import asynccontextmanager
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal, create_tables
from models import (
    ApplicationModel,
    ApplicationStatusEnum,
    ContactModel,
    OutreachStageEnum,
)


# ── Startup ───────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(title="Approach CRM API", lifespan=lifespan)

# Security: enumerate only the exact origins we trust.
# The old "https://*.vercel.app" wildcard is silently ignored by most browsers
# because CORS does not support subdomain wildcards — fixed here.
_ALLOWED_ORIGINS = [o.strip() for o in os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,https://approach-nu.vercel.app",
).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── DB dependency ─────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Auth dependency ───────────────────────────────────────────────────────────
# The frontend Next.js layer (which has the real session) forwards the
# authenticated user's ID as X-User-Id.  A shared BACKEND_API_KEY is used
# to ensure only the trusted Next.js backend can call these endpoints —
# preventing arbitrary callers from spoofing any user ID.

_BACKEND_API_KEY: Optional[str] = os.getenv("BACKEND_API_KEY")


def get_user(
    x_user_id: str = Header(default="anonymous"),
    x_api_key: str = Header(default=""),
) -> str:
    if _BACKEND_API_KEY and x_api_key != _BACKEND_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_user_id


# ── Pydantic request/response models ─────────────────────────────────────────

class ApplicationBody(BaseModel):
    company_name: str
    role_title: str
    stage: OutreachStageEnum
    status: ApplicationStatusEnum
    channel: str
    last_contact_date: str
    job_description_url: Optional[str] = None
    notes: Optional[str] = None


class ContactBody(BaseModel):
    application_id: str
    contact_name: str
    designation: Optional[str] = None
    email_address: Optional[str] = None
    linkedin_url: Optional[str] = None
    notes: Optional[str] = None


# ── Serialisers ───────────────────────────────────────────────────────────────

def _app_dict(m: ApplicationModel) -> dict:
    return {
        "id":                m.id,
        "companyName":       m.company_name,
        "roleTitle":         m.role_title,
        "jobDescriptionUrl": m.job_description_url,
        "stage":             m.stage.value,
        "status":            m.status.value,
        "channel":           m.channel.value,
        "lastContactDate":   str(m.last_contact_date),
        "nextFollowupDate":  str(m.next_followup_date) if m.next_followup_date else None,
        "resumeBucketPath":  m.resume_bucket_path,
        "notes":             m.notes,
        "contacts":          [_contact_dict(c) for c in (m.contacts or [])],
        "createdAt":         m.created_at.isoformat() if m.created_at else "",
    }


def _contact_dict(c: ContactModel) -> dict:
    return {
        "id":            c.id,
        "applicationId": c.application_id,
        "contactName":   c.contact_name,
        "designation":   c.designation,
        "emailAddress":  c.email_address,
        "linkedinUrl":   c.linkedin_url,
        "notes":         c.notes,
    }


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "app": "Approach CRM"}


# ── Applications ──────────────────────────────────────────────────────────────

@app.get("/applications")
def list_applications(
    user_id: str = Depends(get_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(ApplicationModel)
        .filter(ApplicationModel.user_id == user_id)
        .order_by(ApplicationModel.created_at.desc())
        .all()
    )
    return [_app_dict(r) for r in rows]


@app.get("/applications/{app_id}")
def get_application(
    app_id: str,
    user_id: str = Depends(get_user),
    db: Session = Depends(get_db),
):
    m = (
        db.query(ApplicationModel)
        .filter(ApplicationModel.id == app_id, ApplicationModel.user_id == user_id)
        .first()
    )
    if not m:
        raise HTTPException(status_code=404, detail="Application not found")
    return _app_dict(m)


@app.post("/applications", status_code=201)
def create_application(
    body: ApplicationBody,
    user_id: str = Depends(get_user),
    db: Session = Depends(get_db),
):
    from models import ContactChannelEnum
    m = ApplicationModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        company_name=body.company_name,
        role_title=body.role_title,
        job_description_url=body.job_description_url,
        stage=body.stage,
        status=body.status,
        channel=ContactChannelEnum(body.channel),
        last_contact_date=date.fromisoformat(body.last_contact_date),
        notes=body.notes,
        created_at=datetime.now(timezone.utc),
    )
    m.recalculate_followup()
    db.add(m)
    db.commit()
    db.refresh(m)
    return _app_dict(m)


@app.put("/applications/{app_id}")
def update_application(
    app_id: str,
    body: ApplicationBody,
    user_id: str = Depends(get_user),
    db: Session = Depends(get_db),
):
    from models import ContactChannelEnum
    m = (
        db.query(ApplicationModel)
        .filter(ApplicationModel.id == app_id, ApplicationModel.user_id == user_id)
        .first()
    )
    if not m:
        raise HTTPException(status_code=404, detail="Application not found")
    m.company_name        = body.company_name
    m.role_title          = body.role_title
    m.job_description_url = body.job_description_url
    m.stage               = body.stage
    m.status              = body.status
    m.channel             = ContactChannelEnum(body.channel)
    m.last_contact_date   = date.fromisoformat(body.last_contact_date)
    m.notes               = body.notes
    m.recalculate_followup()
    db.commit()
    db.refresh(m)
    return _app_dict(m)


@app.delete("/applications/{app_id}", status_code=204)
def delete_application(
    app_id: str,
    user_id: str = Depends(get_user),
    db: Session = Depends(get_db),
):
    m = (
        db.query(ApplicationModel)
        .filter(ApplicationModel.id == app_id, ApplicationModel.user_id == user_id)
        .first()
    )
    if not m:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(m)
    db.commit()


# ── Dashboard Metrics ─────────────────────────────────────────────────────────

@app.get("/dashboard/metrics")
def dashboard_metrics(
    user_id: str = Depends(get_user),
    db: Session = Depends(get_db),
):
    apps = db.query(ApplicationModel).filter(ApplicationModel.user_id == user_id).all()
    today = date.today()

    total               = len(apps)
    active_interviewing = sum(1 for a in apps if a.status == ApplicationStatusEnum.ACTIVE_INTERVIEWING)
    ghosted             = sum(1 for a in apps if a.stage == OutreachStageEnum.GHOSTED)
    offers              = sum(1 for a in apps if a.stage == OutreachStageEnum.OFFER)
    due_today           = sum(1 for a in apps if a.next_followup_date == today)
    overdue             = sum(1 for a in apps if a.next_followup_date and a.next_followup_date < today)

    closed_positive = sum(
        1 for a in apps
        if a.stage in (
            OutreachStageEnum.INTERVIEW_ROUND,
            OutreachStageEnum.OFFER,
            OutreachStageEnum.TECHNICAL_ASSESSMENT,
        )
    )
    response_rate = round((closed_positive / total * 100), 1) if total else 0.0

    stage_counts: dict[str, int] = {}
    for a in apps:
        stage_counts[a.stage.value] = stage_counts.get(a.stage.value, 0) + 1

    return {
        "total":               total,
        "activeInterviewing":  active_interviewing,
        "ghosted":             ghosted,
        "offers":              offers,
        "dueTodayCount":       due_today,
        "overdueCount":        overdue,
        "responseRate":        response_rate,
        "stageBreakdown":      [{"stage": k, "count": v} for k, v in stage_counts.items()],
    }


# ── Contacts ──────────────────────────────────────────────────────────────────

@app.post("/contacts", status_code=201)
def create_contact(
    body: ContactBody,
    db: Session = Depends(get_db),
):
    c = ContactModel(
        id=str(uuid.uuid4()),
        application_id=body.application_id,
        contact_name=body.contact_name,
        designation=body.designation,
        email_address=body.email_address,
        linkedin_url=body.linkedin_url,
        notes=body.notes,
        created_at=datetime.now(timezone.utc),
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _contact_dict(c)


@app.put("/contacts/{contact_id}")
def update_contact(
    contact_id: str,
    body: ContactBody,
    db: Session = Depends(get_db),
):
    c = db.query(ContactModel).filter(ContactModel.id == contact_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    c.contact_name  = body.contact_name
    c.designation   = body.designation
    c.email_address = body.email_address
    c.linkedin_url  = body.linkedin_url
    c.notes         = body.notes
    db.commit()
    db.refresh(c)
    return _contact_dict(c)


@app.delete("/contacts/{contact_id}", status_code=204)
def delete_contact(
    contact_id: str,
    db: Session = Depends(get_db),
):
    c = db.query(ContactModel).filter(ContactModel.id == contact_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(c)
    db.commit()
