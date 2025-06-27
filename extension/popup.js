document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleSwitch");

  chrome.storage.sync.get("enabled", (data) => {
    const isEnabled = data.enabled ?? true;
    toggle.checked = isEnabled;

    if (data.enabled === undefined) {
      chrome.storage.sync.set({ enabled: true });
    }
  });

  toggle.addEventListener("change", () => {
    const isEnabled = toggle.checked;
    chrome.storage.sync.set({ enabled: isEnabled });

    // 현재 탭에 있는 content.js로 메시지 전송
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggleChanged",
          enabled: isEnabled
        }, (response) => {
          // 선택적으로 응답 처리
          if (chrome.runtime.lastError) {
            console.warn("메시지 전송 실패:", chrome.runtime.lastError.message);
          }
        });
      }
    });
  });
});
