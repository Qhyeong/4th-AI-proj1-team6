from fastapi import FastAPI
from pydantic import BaseModel
from model import load_model, predict_sentence, predict_words, filter_harmful_words
from fastapi.middleware.cors import CORSMiddleware

# ✅ CORS 포함한 FastAPI 인스턴스를 단 한 번 생성
app = FastAPI()

# ✅ CORS 미들웨어 등록
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 필요시 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 모델 로딩
tokenizer, model = load_model("./finetuned-kcbert")

# ✅ 요청 바디 정의
class TextRequest(BaseModel):
    text: str

# ✅ API 엔드포인트 정의
@app.post("/filter/")
async def filter_text(data: TextRequest):
    original_text = data.text

    # 단어 단위 유해 단어 탐지
    harmful_words = predict_words(original_text, tokenizer, model)

    # 유해 단어 필터링
    filtered_text = filter_harmful_words(original_text, harmful_words)

    return {"cleaned_text": filtered_text}
