import os
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter

def get_db_path(book_id: str) -> str:
    return f"../data/{book_id}/faiss_index"

def ingest_book_for_rag(book_id: str, text: str, api_key: str):
    """
    Splits text and creates a FAISS index.
    """
    print(f"Ingesting text for RAG (Book ID: {book_id})...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = splitter.split_text(text)
    
    embeddings = OpenAIEmbeddings(api_key=api_key, model="text-embedding-3-small")
    db = FAISS.from_texts(chunks, embeddings)
    
    db_path = get_db_path(book_id)
    db.save_local(db_path)
    print(f"FAISS index saved to {db_path}")

def query_book(book_id: str, query: str, api_key: str) -> str:
    """
    Queries the book using RAG.
    """
    db_path = get_db_path(book_id)
    if not os.path.exists(db_path):
        return "Error: Book has not been indexed yet."
        
    embeddings = OpenAIEmbeddings(api_key=api_key, model="text-embedding-3-small")
    # Allow dangerous deserialization because valid files are created by us locally
    db = FAISS.load_local(db_path, embeddings, allow_dangerous_deserialization=True)
    
    retriever = db.as_retriever(search_kwargs={"k": 5})
    
    llm = ChatOpenAI(model="gpt-4o-mini", api_key=api_key)
    
    template = """Answer the question based ONLY on the following context:
{context}

Question: {question}
"""
    prompt = ChatPromptTemplate.from_template(template)
    
    from langchain_core.runnables import RunnablePassthrough

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    # To get sources, we need a slightly different chain or just retrieve explicitly first
    docs = retriever.invoke(query)
    answer = rag_chain.invoke(query)
    
    return {
        "answer": answer,
        "sources": [doc.page_content for doc in docs]
    }
