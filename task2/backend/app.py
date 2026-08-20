from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(
    title="Automated Copywriting & Tone Transformer",
    description="Generative AI backend for platform-specific marketing copy",
    version="1.0.0",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request Schema
# --------------------------------------------------

class GenerateRequest(BaseModel):
    productName: str = Field(..., min_length=1)
    productDescription: str = Field(..., min_length=1)

    platform: str = Field(
        ...,
        pattern="^(LinkedIn|Instagram|Email)$"
    )

    tone: str = Field(..., min_length=1)

    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0
    )

    topP: float = Field(
        default=0.9,
        gt=0.0,
        le=1.0
    )


# --------------------------------------------------
# Prompt Template
# --------------------------------------------------

def build_prompt(data: GenerateRequest) -> str:

    prompt = f"""
You are a professional marketing copywriter.

Create marketing copy for the following product.

Product Name:
{data.productName}

Product Description:
{data.productDescription}

Target Platform:
{data.platform}

Tone:
{data.tone}

Requirements:

- Adapt the content specifically for {data.platform}.
- Maintain a {data.tone.lower()} tone.
- Make the copy engaging and professional.
- Clearly communicate the product's value.
- Do not invent unsupported product features.

Generate only the final marketing copy.
"""

    return prompt.strip()


# --------------------------------------------------
# Temporary Generator
# --------------------------------------------------

def generate_demo_copy(data: GenerateRequest) -> str:

    if data.platform == "LinkedIn":
        return (
            f"Introducing {data.productName} — "
            f"{data.productDescription}. "
            f"Discover a smarter way to experience this solution. "
            f"Learn more and see how {data.productName} can "
            f"add value to your everyday needs."
        )

    elif data.platform == "Instagram":
        return (
            f"✨ Meet {data.productName}! "
            f"{data.productDescription}. "
            f"Upgrade your experience today. "
            f"Discover more and make every moment count. 🚀"
        )

    elif data.platform == "Email":
        return (
            f"Subject: Discover {data.productName}\n\n"
            f"Hello,\n\n"
            f"We are excited to introduce {data.productName}. "
            f"{data.productDescription}. "
            f"Discover how it can bring value to you.\n\n"
            f"Best regards"
        )

    return "Marketing copy generated successfully."


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Automated Copywriting & Tone Transformer API is running"
    }


# --------------------------------------------------
# Generate Endpoint
# --------------------------------------------------

@app.post("/api/generate")
def generate_copy(data: GenerateRequest):

    prompt = build_prompt(data)

    generated_copy = generate_demo_copy(data)

    return {
        "success": True,
        "generated_copy": generated_copy,
        "prompt": prompt,
        "parameters": {
            "temperature": data.temperature,
            "top_p": data.topP,
        },
    }
