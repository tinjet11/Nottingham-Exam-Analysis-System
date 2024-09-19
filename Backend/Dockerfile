# backend/Dockerfile
FROM python:3.11.5-slim

WORKDIR /exam-analysis-tool-backend

COPY ./requirements.txt /exam-analysis-tool-backend

RUN pip install -r requirements.txt

COPY *.py /exam-analysis-tool-backend

EXPOSE 3001

CMD ["python3", "-m", "flask", "--app", "server", "run", "--debug", "--host=0.0.0.0", "--port=3001"]
