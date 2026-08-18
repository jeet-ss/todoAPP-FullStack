from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
import uuid 
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# define settings
class Settings(BaseSettings):
    mongodb_url: str
    database_name: str

    class Config:
        env_file = ".env"

settings = Settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Triggers on startup
    print("Initializing MongoDB Client...") # Fallback terminal check
        
    app.mongodb_client = AsyncIOMotorClient(settings.mongodb_url)
    app.database = app.mongodb_client[settings.database_name]


    yield  # FastAPI listens for requests while this yield is active
    
    # Triggers on shutdown
    app.mongodb_client.close()
    print("Disconnected from MongoDB Atlas.")

app = FastAPI(title="My Todo App",
    description="This is a backend API for managing a personal daily todo list.",
    version="1.0.0",
    docs_url="/docs",
    lifespan=lifespan 
)

origins = [
    "https://vercel.app",
    "http://localhost",
    "http://127.0.0.1",
    # Add your frontend URL/port here if using a live server extension (e.g., http://127.0.0.1:5500)
    "*", 
    # 2. Your official production website URL
]
# 3. Add the middleware to your app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    text: str    # Required as no default value #Validation done
    event_date: date = Field(..., alias="event-date")
    class Config:
        # Allows you to populate the model using either 'event-date' or 'event_date'
        populate_by_name = True
        # Ensures that when FastAPI serializes it, it can preserve your preferred key
        by_alias = False 

todoItems = [
    Item(**{
        "id": "df0d82e1-a941-4477-8239-64c4753f94cc",
        "text": "Jeet",
        "event-date": "2026-08-13"
    }),
    Item(**{
        "id": "fb18d807-ad13-4757-8ebb-7a45cf472298",
        "text": "bidisha",
        "event-date": "2026-08-22"
    }),
    Item(**{
        "id": "c3806447-dd04-4b17-a0ea-c9d0e3c827c5",
        "text": "prabir",
        "event-date": "1199-09-09"
    })
]


# Root directory
@app.get("/")
def root():
    return {"Hello" : "World"}

# Add one item
@app.post("/items", response_model=Item)
async def create_item(item: Item):
    if not item.id:
            item.id = str(uuid.uuid4())
    # todoItems.append(item)

    items_collection = app.database["items"]
    # Convert Pydantic object to a standard Python dictionary
    #  using aliases
    item_dict = item.model_dump(mode="json", by_alias=True)
    # Insert document into db
    await items_collection.insert_one(item_dict)

    return item

# Get full list
@app.get("/items", response_model=list[Item])
async def get_item_list(limit: int = 10):
    items_collection = app.database["items"]
    raw_items = await items_collection.find().to_list(length=limit)
    return raw_items[0:limit]

# Update item
@app.put("/items", response_model=Item)
async def update_item(updated_item: Item):
    if not updated_item.id:
        raise HTTPException(
            status_code=400, 
            detail="Item ID is required for updates"
        )
    item_id = updated_item.id

    items_collection = app.database["items"]
    item_dict = updated_item.model_dump(mode="json", by_alias=True)
    # Update the document matching the custom string 'id' field
    result = await items_collection.update_one(
        {"_id": updated_item.id},
        {"$set": item_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Todo item not found")
        
    return updated_item

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str):
    items_collection = app.database["items"]
    
    # Delete the document matching the custom string 'id' field
    result = await items_collection.delete_one({"_id": item_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Todo item not found")
        
    return


@app.get("/db-status")
async def check_mongodb_status():
    try:
        # 1. Fetch server info from Atlas
        server_info = await app.mongodb_client.server_info()
        
        # 2. Return success along with cluster details
        return {
            "status": "connected",
            "message": "Successfully shook hands with MongoDB Atlas!",
            "database": app.database.name,
            "version": server_info.get("version")
        }
    except Exception as e:
        return {
            "status": "failed",
            "error_message": str(e)
        }
