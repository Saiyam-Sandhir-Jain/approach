"""FastAPI + Strawberry GraphQL entry point — Approach CRM."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from contextlib import asynccontextmanager

from database import create_tables, SessionLocal
from schema import schema


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(title="Approach CRM API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://approach-nu.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DBContextGraphQLRouter(GraphQLRouter):
    async def execute_request(self, request, *args, **kwargs):  # type: ignore
        db = SessionLocal()
        # Extract authenticated user ID from header (set by Next.js frontend from session)
        user_id = request.headers.get("X-User-Id", "anonymous")
        try:
            self.schema.extensions = []
            return await super().execute_request(
                request,
                context_value={"db": db, "request": request, "user_id": user_id},
                *args, **kwargs,
            )
        finally:
            db.close()


graphql_router = DBContextGraphQLRouter(schema, graphiql=True)
app.include_router(graphql_router, prefix="/graphql")


@app.get("/health")
def health():
    return {"status": "ok", "app": "Approach CRM"}
