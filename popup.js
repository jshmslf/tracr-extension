const connectScreen = document.getElementById("connect-screen");
const mainScreen = document.getElementById("main-screen");
const phraseInput = document.getElementById("phrase-input");
const connectButton = document.getElementById("connect-button");
const connectError = document.getElementById("connect-error");
const addButton = document.getElementById("add-button");
const dashboardButton = document.getElementById("dashboard-button");
const reviewForm = document.getElementById("review-form");
const addWarning = document.getElementById("add-warning");
const cancelAdd = document.getElementById("cancel-add");
const addStatus = document.getElementById("add-status");
const disconnectButton = document.getElementById("disconnect-button");

function show(el) {
  el.classList.remove("hidden");
}
function hide(el) {
  el.classList.add("hidden");
}

async function getToken() {
  const { tracrToken } = await chrome.storage.local.get("tracrToken");
  return tracrToken ?? null;
}

async function setToken(token) {
  await chrome.storage.local.set({ tracrToken: token });
}

async function clearToken() {
  await chrome.storage.local.remove("tracrToken");
}

async function init() {
  const token = await getToken();
  if (token) {
    show(mainScreen);
  } else {
    show(connectScreen);
  }
}

connectButton.addEventListener("click", async () => {
  const phrase = phraseInput.value.trim();
  if (!phrase) return;

  hide(connectError);
  connectButton.disabled = true;
  connectButton.textContent = "Connecting...";

  try {
    const response = await fetch(`${TRACR_ORIGIN}/api/extension/pair`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phrase }),
    });
    const data = await response.json();

    if (!response.ok) {
      connectError.textContent = data.error ?? "Could not connect.";
      show(connectError);
      return;
    }

    await setToken(data.token);
    hide(connectScreen);
    show(mainScreen);
  } catch {
    connectError.textContent = "Could not reach Tracr. Check your connection.";
    show(connectError);
  } finally {
    connectButton.disabled = false;
    connectButton.textContent = "Connect";
  }
});

dashboardButton.addEventListener("click", () => {
  chrome.tabs.create({ url: `${TRACR_ORIGIN}/applications` });
});

let currentUrl = "";

addButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;
  currentUrl = tab.url;

  const token = await getToken();
  if (!token) {
    await clearToken();
    hide(mainScreen);
    show(connectScreen);
    return;
  }

  addButton.disabled = true;
  addButton.textContent = "Reading page...";
  hide(addStatus);

  try {
    const response = await fetch(`${TRACR_ORIGIN}/api/extension/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url: currentUrl }),
    });

    if (response.status === 401) {
      await clearToken();
      hide(mainScreen);
      show(connectScreen);
      return;
    }

    const result = await response.json();

    document.getElementById("field-jobTitle").value = result.jobTitle ?? "";
    document.getElementById("field-companyName").value = result.companyName ?? "";
    document.getElementById("field-location").value = result.location ?? "";

    if (result.warnings?.length) {
      addWarning.textContent = result.warnings.join(" ");
      show(addWarning);
    } else {
      hide(addWarning);
    }

    show(reviewForm);
  } catch {
    addStatus.textContent = "Could not read this page. Try again.";
    show(addStatus);
  } finally {
    addButton.disabled = false;
    addButton.textContent = "Add this page";
  }
});

cancelAdd.addEventListener("click", () => {
  hide(reviewForm);
  reviewForm.reset();
});

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const token = await getToken();
  if (!token) return;

  const submitButton = reviewForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    const response = await fetch(`${TRACR_ORIGIN}/api/extension/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        jobTitle: document.getElementById("field-jobTitle").value,
        companyName: document.getElementById("field-companyName").value,
        location: document.getElementById("field-location").value,
        jobUrl: currentUrl,
        status: "saved",
      }),
    });

    if (response.status === 401) {
      await clearToken();
      hide(mainScreen);
      show(connectScreen);
      return;
    }

    if (!response.ok) {
      addStatus.textContent = "Could not save this application.";
      show(addStatus);
      return;
    }

    hide(reviewForm);
    reviewForm.reset();
    addStatus.textContent = "Saved to Tracr.";
    show(addStatus);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Save";
  }
});

disconnectButton.addEventListener("click", async () => {
  await clearToken();
  hide(mainScreen);
  show(connectScreen);
});

init();
