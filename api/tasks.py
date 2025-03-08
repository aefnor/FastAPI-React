from celery import Celery
from pypdf import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from celery import chain
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.chains.question_answering import load_qa_chain

app = Celery("tasks")
app.config_from_object("celery_config")


@app.task(queue="default")
def process_uploaded_file(file_path):
    # Add your file processing logic here
    # For example, you can resize images, extract information, etc.
    print(f"Processing file: {file_path}")
    chain(extract_text_from_pdf.s(file_path), chunk_text.s()).apply_async()


@app.task(queue="default")
def process_node(node_id, node_type):
    # Your dynamic task logic here based on node_type
    print(f"Processing node {node_id} of type {node_type}")
    return f"Result for node {node_id} of type {node_type}"


@app.task(queue="default")
def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text


@app.task(queue="default")
def chunk_text(pdf_text, chunk_size=500, chunk_overlap=100):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=chunk_overlap
    )
    chunks = text_splitter.split_text(pdf_text)
    print(f"Split text into {len(chunks)} chunks")
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vector_db = Chroma.from_texts(chunks, embedding_model)
    query = "What does the PDF say about the company name?"
    retrieved_docs = vector_db.similarity_search(
        query, k=3
    )  # Retrieve top 3 relevant chunks

    retrieved_texts = "\n".join([doc.page_content for doc in retrieved_docs])
    print(retrieved_texts)
    # LM Studio local API setup
    local_llm = ChatOpenAI(
        openai_api_base="http://localhost:1234/v1",  # LM Studio's API
        openai_api_key="lm-studio",  # Placeholder (not used)
        model_name="lmstudio-community/QwQ-32B-GGUF",  # Change this to match the model running in LM Studio
        temperature=0.7,
    )

    # Load QA chain for combining documents
    combine_docs_chain = load_qa_chain(local_llm, chain_type="stuff")

    # Create the RetrievalQA pipeline with correct parameters
    rag_chain = RetrievalQA(
        retriever=vector_db.as_retriever(), combine_documents_chain=combine_docs_chain
    )

    query = "What does the PDF say about climate change?"
    response = rag_chain.run(query)

    print(response)
