const connectScreen = document.getElementById("connect-screen");
const mainScreen = document.getElementById("main-screen");
const phraseInput = document.getElementById("phrase-input");
const connectButton = document.getElementById("connect-button");
const connectError = document.getElementById("connect-error");
const actionsRow = document.getElementById("actions-row");
const addButton = document.getElementById("add-button");
const dashboardButton = document.getElementById("dashboard-button");
const reviewForm = document.getElementById("review-form");
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

function requireReconnect() {
  hide(mainScreen);
  show(connectScreen);
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
    phraseInput.value = "";
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

addButton.addEventListener("click", async () => {
  const token = await getToken();
  if (!token) {
    await clearToken();
    requireReconnect();
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  document.getElementById("field-jobUrl").value = tab?.url ?? "";

  hide(actionsRow);
  hide(addStatus);
  show(reviewForm);
});

cancelAdd.addEventListener("click", () => {
  hide(reviewForm);
  reviewForm.reset();
  show(actionsRow);
});

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const token = await getToken();
  if (!token) {
    requireReconnect();
    return;
  }

  const submitButton = reviewForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  const field = (id) => document.getElementById(id).value.trim();

  const payload = {
    jobUrl: field("field-jobUrl"),
    jobTitle: field("field-jobTitle"),
    companyName: field("field-companyName"),
    description: field("field-description"),
    location: field("field-location"),
    jobType: field("field-jobType") || undefined,
    salaryCurrency: field("field-salaryCurrency"),
    salaryPeriod: field("field-salaryPeriod") || undefined,
    salaryMin: field("field-salaryMin") ? Number(field("field-salaryMin")) : undefined,
    salaryMax: field("field-salaryMax") ? Number(field("field-salaryMax")) : undefined,
    status: field("field-status"),
    dateApplied: field("field-dateApplied") || undefined,
    contactPerson: field("field-contactPerson"),
    contactEmail: field("field-contactEmail"),
    notes: field("field-notes"),
  };

  try {
    const response = await fetch(`${TRACR_ORIGIN}/api/extension/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      await clearToken();
      requireReconnect();
      return;
    }

    if (!response.ok) {
      addStatus.textContent = "Could not save this application.";
      show(addStatus);
      return;
    }

    hide(reviewForm);
    reviewForm.reset();
    show(actionsRow);
    addStatus.textContent = "Saved to Tracr.";
    show(addStatus);
  } catch {
    addStatus.textContent = "Could not reach Tracr. Check your connection.";
    show(addStatus);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Save";
  }
});

disconnectButton.addEventListener("click", async () => {
  await clearToken();
  requireReconnect();
});

init();
