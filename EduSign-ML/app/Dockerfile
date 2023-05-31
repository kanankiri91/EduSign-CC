# Base image
FROM python:3.8

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y libgl1-mesa-glx
RUN pip install --no-cache-dir gunicorn

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Set environment variables
ENV MODEL_PATH="/app/model/v3.1.2.h5"
ENV P2S_PATH="/app/p2s_index_map.json"
ENV UPLOAD_PATH="/app/uploads"
ENV SEQUENCE_LENGTH=30

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app