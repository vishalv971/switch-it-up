from fastapi import FastAPI
from api.v1.greet import router as greet_v1_router

app = FastAPI(title="Versioned API Example")

# Include v1 endpoints under the "/v1" prefix
app.include_router(greet_v1_router, prefix="/v1", tags=["v1"])

@app.get("/")
def read_root():
    return {"message": "Welcome! Try /v1/greet or /v2/greet"}