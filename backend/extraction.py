from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

class Entity(BaseModel):
    name: str = Field(description="Name of the character or entity")
    type: str = Field(description="Type of the entity (e.g., Person, Location, Organization)", default="Person")
    description: str = Field(description="Brief description of the entity based on the text", default="")

class Relationship(BaseModel):
    source: str = Field(description="Name of the source entity")
    target: str = Field(description="Name of the target entity")
    type: str = Field(description="Type of relationship (e.g., friend, enemy, family, colleague)")
    description: str = Field(description="Brief description of the relationship", default="")

class ExtractionResult(BaseModel):
    entities: List[Entity]
    relationships: List[Relationship]

SYSTEM_PROMPT = """You are an expert literary analyst. 
Your task is to extract key characters (entities) and their relationships from the provided text chunk of a book.
Focus on major characters and significant interactions.
Return the result in structured JSON format.
"""

def get_extraction_chain(api_key: str):
    llm = ChatOpenAI(model="gpt-4o-mini", api_key=api_key, temperature=0)
    parser = PydanticOutputParser(pydantic_object=ExtractionResult)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("user", "Text: {text}\n\nExtract entities and relationships:"),
    ])
    
    chain = prompt | llm.with_structured_output(ExtractionResult)
    return chain

async def extract_from_chunk(text: str, api_key: str) -> ExtractionResult:
    chain = get_extraction_chain(api_key)
    try:
        result = await chain.ainvoke({"text": text})
        return result
    except Exception as e:
        print(f"Extraction error: {e}")
        return ExtractionResult(entities=[], relationships=[])
