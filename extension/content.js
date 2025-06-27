// FastAPI 서버 URL
const API_URL = "https://web-production-5070.up.railway.app/filter/";

// 텍스트 노드 추출
function extractTextNodes(node) {
  const textNodes = [];
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
  let currentNode;
  while ((currentNode = walker.nextNode())) {
    if (currentNode.nodeValue.trim()) {
      textNodes.push(currentNode);
    }
  }
  return textNodes;
}

// API를 통해 텍스트 필터링
async function filterTextContent() {
  const textNodes = extractTextNodes(document.body);

  for (const node of textNodes) {
    const originalText = node.nodeValue;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText }),
        mode: "cors"
      });

      if (!response.ok) {
        console.error("API 요청 실패:", response.status);
        continue;
      }

      const data = await response.json();
      const cleanedText = data.cleaned_text;

      if (cleanedText !== originalText) {
        node.nodeValue = cleanedText;
      }
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
    }
  }
}

// 상태 변경 시 필터링 여부를 설정
let doWork = true;  // 기본적으로 켜짐

// 페이지 로딩 후 실행
window.addEventListener("load", () => {
  chrome.storage.sync.get("enabled", (data) => {
    doWork = !!data.enabled;  // 저장된 값으로 상태 설정

    if (doWork) {
      filterTextContent();
    }
  });
});

// 메시지 리스너: 팝업에서 상태 변경 시
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "toggleChanged") {
    doWork = message.enabled;
    if (doWork) {
      filterTextContent();  // 상태가 켜졌을 때 필터링 실행
    }
    else{
      location.reload();
    }
  }
});
