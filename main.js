document.querySelector('#strings-editable').style.display = "none";

function toggle() {
  const element = document.querySelector('#strings-editable');
  if (element.style.display === "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}

window.addEventListener("load", function () {
  const openingInput = document.getElementById("extractor-opening-input");
  const closingInput = document.getElementById("extractor-closing-input");

  const savedOpeningInput = localStorage.getItem("openingInput");
  const savedClosingInput = localStorage.getItem("closingInput");

  if (savedOpeningInput) {
    openingInput.value = savedOpeningInput;
  } else {
    openingInput.value = "contentItem%3A";
  }

  if (savedClosingInput) {
    closingInput.value = savedClosingInput;
  } else {
    closingInput.value = "&pdt";
  }

  openingInput.addEventListener("input", function () {
    localStorage.setItem("openingInput", openingInput.value);
  });

  closingInput.addEventListener("input", function () {
    localStorage.setItem("closingInput", closingInput.value);
  });
});

document.getElementById("extractor-textarea").addEventListener("input", extractText);

function extractText() {
  event.preventDefault();

  const openingInput = document.getElementById("extractor-opening-input").value;
  const closingInput = document.getElementById("extractor-closing-input").value;

  const textarea = document.getElementById("extractor-textarea").value;
  const lines = textarea.split("\n");
  const extractedTextMap = new Map();

  for (const line of lines) {
    let startIndex = 0;
    let endIndex = 0;
    let extractedText = "";
    let count = 0;
    while (startIndex !== -1 && endIndex !== -1) {
      startIndex = line.indexOf(openingInput, startIndex);
      if (startIndex !== -1) {
        count++;
        endIndex = line.indexOf(closingInput, startIndex);
        extractedText = line.substring(startIndex + openingInput.length, endIndex);
        if (extractedTextMap.has(extractedText)) {
          extractedTextMap.set(extractedText, extractedTextMap.get(extractedText) + 1);
        } else {
          extractedTextMap.set(extractedText, 1);
        }
        startIndex = endIndex;
      }
    }
  }
  let extractedTextList = "";
  for (const [extractedText, count] of extractedTextMap) {
    if (count > 1) {
      extractedTextList += `<li><span style="background-color: #fff59d">${extractedText}${count > 1 ? ` (${count})` : ""}</span></li>`;
    } else {
      extractedTextList += `<li>${extractedText}${count > 1 ? ` (${count})` : ""}</li>`;
    }
  }
  document.getElementById("extractor-results").innerHTML = `<ol>${extractedTextList}</ol>`;


  const resultsList = document.getElementById('extractor-results');
  const totalCountSpan = document.getElementById('list-total-count');
  const listItems = resultsList.querySelectorAll('li');

  totalCountSpan.textContent = listItems.length.toString();



  document.querySelector('#extractor-hidden-clipboard-output').value = extractedTextList
    .replaceAll("</li>", "</li>\n")
    .replace(/\(\d+\)/g, "")
    .replaceAll("</li>", "")
    .replaceAll("<li>", "")
    .replaceAll("  ", "")
    .replaceAll(" ", "")
    .replaceAll("<spanstyle=\"background-color:#fff59d\">", "")
    .replaceAll("</span>", "")
}

function checkForDuplicates() {
  const extractedTextMap = new Map();
  const extractedTextList = document.querySelectorAll('#extractor-results ol li span, #extractor-results ol li');
  let hasDuplicates = false;

  extractedTextList.forEach((li) => {
    const extractedText = li.textContent.trim().replace(/\(\d+\)/g, '');
    if (extractedTextMap.has(extractedText)) {
      hasDuplicates = true;
      extractedTextMap.set(extractedText, extractedTextMap.get(extractedText) + 1);
    } else {
      extractedTextMap.set(extractedText, 1);
    }
  });

  if (hasDuplicates) {
    const duplicateNotification = document.getElementById('duplicate-lni-notification-container');
    let extractedTextList = '';
    for (const [extractedText, count] of extractedTextMap) {
      if (count > 1) {
        extractedTextList += `<li>${extractedText}</li>`;
      }
    }
    duplicateNotification.innerHTML = `<p>Duplicate values found:</p><ul>${extractedTextList}</ul>`;
    duplicateNotification.style.display = 'block';
  } else {
    document.getElementById('duplicate-lni-notification-container').style.display = 'none';
  }
}

document.getElementById('extractor-textarea').addEventListener('input', function () {
  extractText();
  checkForDuplicates();
});

document.querySelector('#copy-btn').addEventListener("click", function () {
  document.querySelector("#extractor-hidden-clipboard-output").select();
  document.execCommand("copy");
});

document.querySelector('#clear-btn').addEventListener("click", function () {
  document.querySelector("#extractor-textarea").value = "";
  document.querySelector('#extractor-results').innerHTML = "";
  document.querySelector('#list-total-count').innerHTML = "0";
  document.querySelector('#duplicate-lni-notification-container').innerHTML = "";
});