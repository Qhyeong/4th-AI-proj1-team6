from transformers import BertTokenizer, BertForSequenceClassification, AutoTokenizer, AutoModelForSequenceClassification
import torch
import re

def load_model(model_path):
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    model.eval()
    return tokenizer, model

def predict_sentence(text, tokenizer, model):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        pred = torch.argmax(logits, dim=1).item()
    return pred  # 0: 비유해, 1: 유해

def predict_words(text, tokenizer, model):
    words = re.findall(r"\b\w+\b", text)
    harmful_words = []
    for word in words:
        if predict_sentence(word, tokenizer, model) == 1:
            harmful_words.append(word)
    return harmful_words

def filter_harmful_words(text, harmful_words):
    for word in harmful_words:
        masked = '*' * len(word)
        text = re.sub(rf"\b{re.escape(word)}\b", masked, text)
    return text