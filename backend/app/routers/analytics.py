from fastapi import APIRouter

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("")
async def analytics():
    return {
        "totalViews": 1350000,
        "avgCtr": 7.4,
        "watchTimeHours": 412000,
        "subscribers": 86200,
    }
