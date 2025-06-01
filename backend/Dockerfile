FROM python:3.10-slim

WORKDIR /app

# Install poppler-utils (for PDF parsing) and build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    libpoppler-cpp-dev \
    poppler-utils \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir \
    torch==2.6.0+cpu \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt


# Copy the rest of the backend
COPY . .

# Set environment variables (override these in Compose or deploy env)
ENV FLASK_APP=bot.py
ENV FLASK_RUN_HOST=0.0.0.0

# Expose the backend port
EXPOSE 5000

# Run the app
CMD ["python", "bot.py"]
