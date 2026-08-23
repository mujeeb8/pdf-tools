function hasExtension(file, extensions) {
  const name = file.name.toLowerCase();
  return extensions.some((extension) => name.endsWith(extension));
}

function isAllowed(file, kind) {
  if (kind === "pdf") {
    return file.type === "application/pdf" || hasExtension(file, [".pdf"]);
  }

  return ["image/jpeg", "image/png"].includes(file.type) ||
    hasExtension(file, [".jpg", ".jpeg", ".png"]);
}

function setInputFiles(input, files) {
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function setupDropZone({ input, zones, status, clearButton, kind, preview, accent }) {
  let previewUrl;

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = undefined;
    }
    preview.clear();
  };

  const acceptFiles = (fileList) => {
    const files = [...fileList];
    const invalidFile = files.find((file) => !isAllowed(file, kind));

    if (!files.length) {
      return;
    }

    if (invalidFile) {
      input.value = "";
      clearPreview();
      status.textContent = kind === "pdf"
        ? "Only PDF files are accepted."
        : "Only JPG and PNG files are accepted.";
      return;
    }

    setInputFiles(input, kind === "pdf" ? files.slice(0, 1) : files);
  };

  input.addEventListener("change", (event) => {
    const files = [...input.files];
    if (!files.length) {
      clearPreview();
      return;
    }

    const invalidFile = files.find((file) => !isAllowed(file, kind));
    if (invalidFile) {
      event.stopImmediatePropagation();
      input.value = "";
      clearPreview();
      status.textContent = kind === "pdf"
        ? "Only PDF files are accepted."
        : "Only JPG and PNG files are accepted.";
      return;
    }

    clearPreview();
    preview.show(files);
  }, true);

  clearButton.addEventListener("click", () => {
    input.value = "";
    clearPreview();
    status.textContent = kind === "pdf"
      ? "Select or drop a PDF."
      : "Select or drop JPG and PNG files.";
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    zones.forEach((zone) => zone.addEventListener(eventName, (event) => {
      event.preventDefault();
      zone.classList.add("ring-4", `ring-${accent}-200`, `border-${accent}-600`);
    }));
  });

  ["dragleave", "drop"].forEach((eventName) => {
    zones.forEach((zone) => zone.addEventListener(eventName, (event) => {
      event.preventDefault();
      zone.classList.remove("ring-4", `ring-${accent}-200`, `border-${accent}-600`);
    }));
  });

  zones.forEach((zone) => zone.addEventListener("drop", (event) => {
    if (event.target.closest("iframe")) {
      return;
    }
    acceptFiles(event.dataTransfer.files);
  }));

  return { clearPreview };
}

export function setupPdfDrop(inputId, zoneId, statusId, previewId, emptyId, clearId, previewZoneId, accent = "red") {
  const input = document.getElementById(inputId);
  const zone = document.getElementById(zoneId);
  const previewZone = document.getElementById(previewZoneId);
  const status = document.getElementById(statusId);
  const frame = document.getElementById(previewId);
  const empty = document.getElementById(emptyId);
  const clearButton = document.getElementById(clearId);

  setupDropZone({
    input,
    zones: [zone, previewZone],
    status,
    clearButton,
    kind: "pdf",
    accent,
    preview: {
      clear: () => {
        frame.src = "about:blank";
        frame.classList.add("hidden");
        empty.classList.remove("hidden");
      },
      show: (files) => {
        frame.src = URL.createObjectURL(files[0]);
        frame.classList.remove("hidden");
        empty.classList.add("hidden");
      },
    },
  });
}

export function setupImageDrop(inputId, zoneId, statusId, previewId, emptyId, clearId, previewZoneId, accent = "red") {
  const input = document.getElementById(inputId);
  const zone = document.getElementById(zoneId);
  const previewZone = document.getElementById(previewZoneId);
  const status = document.getElementById(statusId);
  const preview = document.getElementById(previewId);
  const empty = document.getElementById(emptyId);
  const clearButton = document.getElementById(clearId);

  setupDropZone({
    input,
    zones: [zone, previewZone],
    status,
    clearButton,
    kind: "image",
    accent,
    preview: {
      clear: () => {
        preview.innerHTML = "";
        preview.classList.add("hidden");
        preview.classList.remove("grid");
        empty.classList.remove("hidden");
      },
      show: (files) => {
        preview.innerHTML = "";
        files.forEach((file) => {
          const figure = document.createElement("figure");
          figure.className = `overflow-hidden border border-${accent}-900/15 bg-${accent}-50`;
          const image = document.createElement("img");
          image.src = URL.createObjectURL(file);
          image.alt = file.name;
          image.className = "aspect-square w-full object-cover";
          const caption = document.createElement("figcaption");
          caption.className = "truncate p-2 text-xs text-red-900/60";
          caption.textContent = file.name;
          figure.append(image, caption);
          preview.append(figure);
        });
        preview.classList.remove("hidden");
        preview.classList.add("grid");
        empty.classList.add("hidden");
      },
    },
  });
}
