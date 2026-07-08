from fastapi import APIRouter
from app.api.v1.ai import router as ai_router
from app.api.v1.pdf import router as pdf_router
from app.api.v1.image import router as image_router

api_router = APIRouter()

# Register sub-routers
api_router.include_router(ai_router, prefix="/v1/ai", tags=["AI Modules"])
api_router.include_router(pdf_router, prefix="/v1/pdf", tags=["PDF Modules"])
api_router.include_router(image_router, prefix="/v1/image", tags=["Image Modules"])
