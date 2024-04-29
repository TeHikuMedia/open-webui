from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

import logging

from pydantic import BaseModel


from utils.utils import (
    get_admin_user,
)
from config import (
    SRC_LOG_LEVELS,
    PAPAREO_TOKEN,
)


log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["OPENAI"])

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.PAPAREO_TOKEN = PAPAREO_TOKEN


class TokenUpdateForm(BaseModel):
    token: str


@app.get("/token")
async def get_papareo_token(user=Depends(get_admin_user)):
    return {"PAPAREO_TOKEN": app.state.PAPAREO_TOKEN}


@app.post("/token/update")
async def update_papareo_token(form_data: TokenUpdateForm, user=Depends(get_admin_user)):
    app.state.PAPAREO_TOKEN = form_data.token
    return {"PAPAREO_TOKEN": app.state.PAPAREO_TOKEN}
