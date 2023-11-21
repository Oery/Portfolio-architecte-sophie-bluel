const Auth = {
    isLoggedIn() {
        return !!sessionStorage.getItem("token");
    },

    logOut() {
        sessionStorage.removeItem("token");
        window.location.reload();
    },
};

const DOMUtils = {
    createElem(tag, properties = {}) {
        const elem = document.createElement(tag);
        Object.entries(properties).forEach(([key, value]) => {
            if (key.startsWith("data-")) elem.dataset[key.replace("data-", "")] = value;
            elem[key] = value;
        });
        return elem;
    },
};

const Modals = {
    createBaseModal(title) {
        const modal = DOMUtils.createElem("dialog", { classList: "projects-modal", id: "current-modal" });
        const modalTitle = DOMUtils.createElem("h3", { innerText: title });
        modal.appendChild(modalTitle);
        modal.appendChild(createCloseButton(modal));
        return modal;
    },

    spawnModal(modal) {
        modal.onclick = this.closeIfOutsideClick;
        document.querySelector("body").appendChild(modal);
        modal.showModal();
    },

    spawnProjectManager() {
        const modal = Modals.createBaseModal("Galerie Photo");
        modal.appendChild(createWorksManager());
        modal.appendChild(createDivider());
        modal.appendChild(createAddPictureButton(modal));
        Modals.spawnModal(modal);
    },

    spawnAddProjectModal() {
        const modal = Modals.createBaseModal("Ajout photo");
        const form = createForm();
        modal.appendChild(createBackButton(modal));
        modal.appendChild(form);
        Modals.spawnModal(modal);
    },

    closeIfOutsideClick(e) {
        if (e.target.tagName !== "DIALOG") return;
        const rect = e.target.getBoundingClientRect();
        const clickedInsideDialog =
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width;
        if (!clickedInsideDialog) e.target.remove();
    },
};

const Editor = {
    init() {
        if (!Auth.isLoggedIn()) return;

        this.setLogOutButton();
        this.spawnBanner();
        this.spawnEditButton();
        this.hideFilter();
    },

    setLogOutButton() {
        const loginPageLink = document.getElementById("login-page-link");
        loginPageLink.innerText = "logout";
        loginPageLink.href = "#";
        loginPageLink.onclick = Auth.logOut;
    },

    spawnBanner() {
        const body = document.querySelector("body");
        const banner = DOMUtils.createElem("div", { className: "editor-banner" });
        banner.appendChild(DOMUtils.createElem("img", { src: "./assets/icons/editor-mode.svg" }));
        banner.appendChild(DOMUtils.createElem("span", { innerText: "Mode édition" }));

        body.insertBefore(banner, body.childNodes[0]);

        // Fix Header
        const header = document.getElementById("main-header");
        header.classList.add("editor");
    },

    spawnEditButton() {
        const title = document.querySelector("#portfolio h2");
        const button = DOMUtils.createElem("a", {
            className: "button-modifier",
            onclick: Modals.spawnProjectManager,
        });

        button.appendChild(DOMUtils.createElem("img", { src: "./assets/icons/edit.svg" }));
        button.appendChild(DOMUtils.createElem("label", { innerText: "modifier" }));
        title.appendChild(button);
        title.classList.add("editor");
    },

    hideFilter() {
        const filters = document.getElementById("filters");
        filters.style.display = "none";
    },
};

Editor.init();

function createDivider() {
    return DOMUtils.createElem("div", { classList: "modal-border" });
}

function createCloseButton(modal) {
    return DOMUtils.createElem("img", {
        src: "./assets/icons/close.svg",
        classList: "close-button",
        onclick: () => modal.remove(),
    });
}

function createBackButton(modal) {
    return DOMUtils.createElem("img", {
        src: "./assets/icons/back.svg",
        classList: "back-button",
        onclick: () => {
            modal.remove();
            Modals.spawnProjectManager();
        },
    });
}

function createWorksManager() {
    const worksManager = DOMUtils.createElem("div", { classList: "works-container" });
    importWorks().forEach((work) => worksManager.appendChild(createWorkManager(work)));
    return worksManager;
}

function createWorkManager(work) {
    const container = DOMUtils.createElem("div", { "data-id": work.id, classList: "work-container" });
    container.appendChild(DOMUtils.createElem("img", { src: work.imageUrl }));
    container.appendChild(createDeleteWorkButton(work.id));
    return container;
}

function createDeleteWorkButton(workId) {
    const deleteWorkButton = DOMUtils.createElem("button", { onclick: () => deleteWork(workId) });
    const deleteWorkIcon = DOMUtils.createElem("img", { src: "./assets/icons/delete.svg" });
    deleteWorkButton.appendChild(deleteWorkIcon);
    return deleteWorkButton;
}

function createAddPictureButton(modal) {
    return DOMUtils.createElem("button", {
        innerText: "Ajouter une photo",
        classList: "modal-button",
        onclick: () => {
            modal.remove();
            Modals.spawnAddProjectModal();
        },
    });
}

function createFileInput() {
    const fileContainer = DOMUtils.createElem("div", { classList: "file-input-container" });
    const fileImg = DOMUtils.createElem("img", { src: "./assets/icons/image.svg" });
    fileContainer.appendChild(fileImg);
    fileContainer.appendChild(createFileLabel());
    fileContainer.appendChild(DOMUtils.createElem("p", { innerText: "jpg, png : 4mo max" }));
    return fileContainer;
}

function createFileLabel() {
    const label = DOMUtils.createElem("label", { innerText: "+ Ajouter photo" });
    label.appendChild(
        DOMUtils.createElem("input", {
            type: "file",
            accept: ".png,.jpg",
            name: "image",
            oninput: validateForm,
            onchange: handleFileChange,
        })
    );
    return label;
}

function createTitleInput() {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(DOMUtils.createElem("label", { innerText: "Titre" }));
    fragment.appendChild(DOMUtils.createElem("input", { type: "text", name: "title", oninput: validateForm }));
    return fragment;
}

function createCategoryInput() {
    const fragment = document.createDocumentFragment();
    const categoryInput = DOMUtils.createElem("select", { name: "category" });
    importCategories().forEach((category) => {
        categoryInput.appendChild(DOMUtils.createElem("option", { innerText: category.name }));
    });
    fragment.appendChild(DOMUtils.createElem("label", { innerText: "Catégorie" }));
    fragment.appendChild(categoryInput);
    return fragment;
}

function createSubmitButton() {
    return DOMUtils.createElem("input", {
        type: "submit",
        disabled: true,
        value: "Valider",
        classList: "modal-button",
        onclick: handleSubmitClick,
    });
}

async function handleSubmitClick(e) {
    e.preventDefault();
    const form = document.getElementById("add-work-form");
    const formData = new FormData(form);

    const category = formData.get("category");
    formData.set("category", getCategoryId(category));

    const work = await addWorkToDatabase(formData);
    addWork(work);
    addWorkToGallery(work);
    document.getElementById("current-modal").remove();
    Modals.spawnProjectManager();
}

async function addWorkToDatabase(formData) {
    const res = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        body: formData,
    });

    if (!res.ok) {
        alert("Erreur pendant l'upload");
        console.error(res);
        return;
    }

    return await res.json();
}

function createForm() {
    const form = DOMUtils.createElem("form", { id: "add-work-form", enctype: "multipart/form-data" });
    form.appendChild(createFileInput());
    form.appendChild(createTitleInput());
    form.appendChild(createCategoryInput());
    form.appendChild(createDivider());
    form.appendChild(createSubmitButton());
    return form;
}

function getCategoryId(name) {
    if (name === defaultFilter) return -1;
    const obj = importCategories().find((item) => item.name === name);
    return obj ? obj.id : null;
}

function validateForm() {
    const modal = document.getElementById("current-modal");
    const titleInput = modal.querySelector("input[type='text']");
    const categoryInput = modal.querySelector("select");
    const fileInput = modal.querySelector("input[type='file']");
    const submitButton = modal.querySelector("input[type='submit']");

    const title = titleInput.value;
    const category = getCategoryId(categoryInput.value);
    const image = fileInput.files ? fileInput.files[0] : null;

    if (title && category && image) submitButton.disabled = false;
}

function isTooLarge(image) {
    const MAX_FILE_SIZE = 4_194_304; // 4 Mo
    return image.size > MAX_FILE_SIZE;
}

function handleFileChange(e) {
    const image = e.target.files[0];
    const container = document.getElementsByClassName("file-input-container")[0];
    const label = container.querySelector("label");

    if (isTooLarge(image)) {
        alert("L'image est trop lourde. Taille maximum : 4 Mo");
        input.value = "";
        return;
    }

    container.querySelector("img").style.display = "none";
    container.querySelector("p").style.display = "none";
    label.innerText = "";
    label.appendChild(e.target);
    label.classList.add("file-preview");
    let filePreview = label.querySelector("img");
    if (!filePreview) {
        filePreview = document.createElement("img");
        label.appendChild(filePreview);
    }
    filePreview.src = URL.createObjectURL(image);
}
