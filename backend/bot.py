import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS  
import google.generativeai as genai
from langchain.llms.base import LLM
from typing import Optional, List
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFacePipeline
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from transformers import pipeline

load_dotenv()

# to connect with the frontend using websockets.
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASKKEY')
CORS(app)  # This will allow all origins; customize as needed

socketio = SocketIO(app, cors_allowed_origins="*")

#the better these models, the better the output.
EMBEDDINGS_MODEL_NAME = os.getenv('EMBEDDINGS_MODEL_NAME')
TEXTGEN_MODEL_NAME = os.getenv('TEXTGEN_MODEL_NAME')
FAISS_FOLDER_NAME = os.getenv('FAISS_FOLDER_NAME')
PDF_FOLDER_NAME = os.getenv('PDF_FOLDER_NAME')
API_MODEL=os.getenv('API_MODEL') # if 'true' then use api key of gemini instead of huggingface 
API_MODEL_KEY=os.getenv('API_MODEL_KEY')
API_MODEL_NAME=os.getenv('API_MODEL_NAME')

class GeminiLLM(LLM):
    model: str
    api_key: str

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        genai.configure(api_key=self.api_key)
        model = genai.GenerativeModel(self.model)
        response = model.generate_content(prompt)
        return response.text

    @property
    def _llm_type(self) -> str:
        return "gemini"

# ---------- PDF processing and QA chain setup ---------------
def load_documents_and_index(chunkSize = 1000, chunkOvLap=200):

    # Load PDFs
    pdf_folder = PDF_FOLDER_NAME
    # Ensure the folder exists
    os.makedirs(pdf_folder, exist_ok=True)
    documents = []
    for file in os.listdir(pdf_folder):
        if file.endswith('.pdf'):
            loader = PyPDFLoader(os.path.join(pdf_folder, file))
            documents.extend(loader.load())

    # Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunkSize, chunk_overlap=chunkOvLap)
    chunks = text_splitter.split_documents(documents)

    # Create embeddings
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL_NAME)

    # Load or create FAISS index
    index_path = FAISS_FOLDER_NAME
    if os.path.exists(index_path):
        vectorstore = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
    else:
        if not chunks:
            from langchain.docstore.document import Document
            dummy = Document(page_content="", metadata={})
            chunks = [dummy]

        vectorstore = FAISS.from_documents(chunks, embeddings)
        vectorstore.save_local(index_path)
    return vectorstore


# Initialize vectorstore and QA chain once on startup
vectorstore = load_documents_and_index()

#proper template
prompt_template = """Use th below context to answer questions. Follow these rules:
1. Be concise.
2. If you don't have enough information, say "I don't know" without guessing.
3. Include only the sources that directly contribute to your answer.
Context:
{context}
Question: {question}
Answer:"""


PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["question", "context"]
)

# Set up the RetrievalQA chain
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})

if API_MODEL.lower() == 'true':
    print("Using Gemini API model")
    llm = GeminiLLM(model=API_MODEL_NAME, api_key=API_MODEL_KEY)
else:
    print("Using Hugging Face local model")
    llm = HuggingFacePipeline(pipeline=pipeline(
        'text2text-generation',
        model=TEXTGEN_MODEL_NAME,
        max_length=1024
    ))

#chain
qa_chain = RetrievalQA.from_chain_type(
    # language model pipeline
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": PROMPT}
)
#------------------------------------------------------


def update_index_with_pdf(file_path):
    # Load the new PDF only
    loader = PyPDFLoader(file_path)
    new_documents = loader.load()
    
    # Split the new document into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    new_chunks = text_splitter.split_documents(new_documents)
    
    # Add new chunks to the existing vectorstore incrementally
    vectorstore.add_documents(new_chunks)
    
    # Save the updated index to disk
    vectorstore.save_local(FAISS_FOLDER_NAME)

# ---------- SocketIO event handlers ----------

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('bot_response', {'answer': 'Welcome! Ask me a question about your PDFs.'})

@socketio.on('ask_question')
def handle_question(data):
    question = data.get('question')
    print(f"Received question: {question}")
    try:
        result = qa_chain.invoke(input={"query": question})
        answer = result.get("result", "")

        # Ensure sources exist before accessing metadata
        source_docs = result.get("source_documents", [])
        sources = [os.path.basename(doc.metadata['source']) for doc in source_docs if hasattr(doc, 'metadata') and 'source' in doc.metadata]

        if answer != "I don't know" and sources:
            answer += f"\n\n|| Sources Consulted: {', '.join(sources)}"     
        answer = "Answer: " + answer   
        emit('bot_response', {'answer': answer})
    except Exception as e:
        emit('bot_response', {'answer': f"Error: {str(e)}"})


# ------ DROP BUTTON REST API ------
@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    pdf_folder = PDF_FOLDER_NAME

    if not file.filename.endswith('.pdf'):
        return jsonify({"error": "File doesn't have .pdf extension"}), 400
    os.makedirs(pdf_folder, exist_ok=True)
    file_path = os.path.join(pdf_folder, file.filename)
    file.save(file_path)
    
    try:
        update_index_with_pdf(file_path)
        return jsonify({"message": f"{file.filename} uploaded and index updated."}), 200
    except Exception as e:
        return jsonify({"error": f"Error updating index: {str(e)}"}), 500

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": f"UP AND RUNNING."}), 200



if __name__ == '__main__':
    os.makedirs(FAISS_FOLDER_NAME, exist_ok=True)
    socketio.run(app,host='0.0.0.0', port=5000,allow_unsafe_werkzeug=True)
