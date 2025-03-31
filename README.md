# CubeChat

**CubeChat** is an interactive chatbot built with **React** and **Python** that allows users to ask questions about PDF documents uploaded to the system. It uses **FAISS** for document indexing and **HuggingFace** for language model inference.
- It was my attempt at setting up a **RAG** pipeline and using it effectively in a project.
- You simply need to give better models name in .env file and the responses will automatically get better.


## Features
- Upload PDFs via a button that automatically updates the FAISS index.
- Ask questions related to the content of the uploaded PDFs.
- Interactive chat interface with real-time bot responses.
- 3D Cube animation (to pass time)
- Flask backend with WebSocket support for real-time communication.


## Frontend (React)

The frontend is a **React** application that displays the chatbox and an interactive 3D cube on the page. WIth limited frontend knowledge, I had it built with the help of online ai tools.

### Key Components:
- **ChatBox**: Manages the chat interface and user input/output.
- **DropButton**: Allows the user to upload PDFs and update the FAISS index.
- **ThreeDCube**: Visual animation of a rotating cube. I just wanted to fill the screen. :3

### To run the frontend locally:
1. Clone the repository.
2. Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Start the development server:
    ```bash
    npm run dev
    ```

The React app will be available at [http://localhost:8080](http://localhost:8080).

## Backend (Python)

The backend is a **Flask** server that handles the PDF uploads, creates embeddings, stores them in FAISS, and handles user queries via WebSocket.

### Dependencies:
- **Flask**: Web framework for the backend.
- **Langchain**: For document loaders, embeddings, and vector storage.
- **FAISS**: For fast approximate nearest neighbor search.
- **HuggingFace**: For the LLM model used for querying and answering.
- **PyPDFLoader**: For extracting text from uploaded PDFs.


### Basic Set-up
Set up these variables in your own ".env" file 
- EMBEDDINGS_MODEL_NAME = < to create embeddings of text >
- TEXTGEN_MODEL_NAME = < text generation model name >
- FAISS_FOLDER_NAME = < folder to store faiss vectors >
- PDF_FOLDER_NAME = < folder name to store pdfs uploaded by user >

### To run the backend locally:
1. Navigate to the backend folder:
    ```bash
    cd backend
    ```
2. Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
3. Start the Flask app:
    ```bash
    python app.py
    ```

The backend will be available at [http://localhost:5000](http://localhost:5000).

## API Endpoints

### Upload PDF
- **POST** `/upload_pdf`
    - Allows users to upload PDF files.
    - Upon upload, the PDF is saved and indexed using FAISS.
    - `multipart/form-data` format.
    - Example:
        ```bash
        curl -X POST -F "file=@your-pdf-file.pdf" http://localhost:5000/upload_pdf
        ```

### Ask a Question - WEBSOCKET
- **POST** `/ask_question`
    - Sends a user query to the backend, retrieves relevant information from the FAISS index, and returns an answer.
    - Input format:
        ```json
        {
            "question": "Your question here"
        }
        ```
    - Example response:
        ```json
        {
            "answer": "Answer: <This is the response to your question> <optional: sources>",
        }
        ```

## Key Flow

1. **PDF Upload**: When the user uploads a PDF using the **DropButton**, the file is saved to the server and processed using `PyPDFLoader`. The content is split into chunks and stored in FAISS.
2. **User Queries**: When the user asks a question via the chat interface, the frontend sends the query to the Flask backend.
3. **Query Processing**: The backend processes the query using the LLM model, retrieves context from the FAISS index, and sends the response back to the frontend.
4. **Interactive Chat**: The chat interface on the frontend displays the answer, along with any relevant sources.

## Technologies Used
- **Frontend**: React, Vite, TailwindCSS, WebSocket (for real-time communication).
- **Backend**: Flask, Langchain, HuggingFace, FAISS.
- **3D Cube**: Custom animations for the interactive cube.

## License

This project is licensed under the Bird Organization's License - see the [BIRD_ORGANIZATION_VERY_REAL_LICENSE](BIRD_ORGANIZATION_VERY_REAL_LICENSE) file for details.


