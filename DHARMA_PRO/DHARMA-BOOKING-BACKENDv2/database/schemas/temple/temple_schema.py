from pydantic import BaseModel


class TempleBase(BaseModel):
    templeName: str
    location: str


class TempleCreate(TempleBase):
    pass


class TempleUpdate(BaseModel):
    templeName: str | None = None
    location: str | None = None


class TempleResponse(TempleBase):
    templeId: int

    class Config:
        from_attributes = True
