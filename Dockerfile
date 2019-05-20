FROM allennlp/allennlp:v0.8.3

WORKDIR /local
COPY model.tar.gz /local/
COPY static/ /local/static/
ADD ./requirements.txt /local/requirements.txt
RUN pip3 install -r requirements.txt
RUN python -m spacy download en_core_web_sm

ENTRYPOINT []
CMD ["python", \
        "-m", "allennlp.service.server_simple", \
        "--archive-path", "model.tar.gz", \
        "--predictor", "seq2seq", \
        "--static-dir","static", \
        "--port","1337"]
