const defaultFilter = "Tous";
let works = [];
let categories = [];

function importWorks() {
    return works;
}

function addWork(work) {
    works.push(work);
}

function importCategories() {
    return categories;
}

async function fetchWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    return await response.json();
}

async function fetchCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    return await response.json();
}

async function deleteWork(id) {
    const res = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    });

    if (!res.ok) {
        alert("Erreur lors de la suppression");
        console.error(res);
        return;
    }

    works = works.filter((work) => work.id != id);

    const gallery = document.getElementsByClassName("gallery")[0];
    Array.from(gallery.children).forEach((child) => {
        if (child.getAttribute("data-id") === id.toString()) {
            child.remove();
        }
    });

    const worksContainer = document.getElementsByClassName("works-container")[0];
    Array.from(worksContainer.children).forEach((child) => {
        if (child.getAttribute("data-id") === id.toString()) {
            child.remove();
        }
    });
}

function addWorkToGallery(work) {
    const gallery = document.getElementsByClassName("gallery")[0];
    const figure = DOMUtils.createElem("figure", { "data-category": work.categoryId, "data-id": work.id });
    figure.appendChild(DOMUtils.createElem("img", { src: work.imageUrl }));
    figure.appendChild(DOMUtils.createElem("figcaption", { innerText: work.title }));

    gallery.appendChild(figure);
}

function sortGallery(category) {
    const gallery = document.getElementsByClassName("gallery")[0];

    for (const work of gallery.children) {
        if (category.toString() === work.getAttribute("data-category") || category === -1) {
            work.style.display = "block";
        } else {
            work.style.display = "none";
        }
    }
}

function handleFilterClick(e) {
    const filter = e.target;
    if (filter.classList.contains("toggled")) return;
    filter.classList.add("toggled");

    const filtersContainer = document.getElementById("filters");
    const buttons = filtersContainer.getElementsByClassName("filter");

    for (const button of buttons) {
        if (button.innerText !== filter.innerText) {
            button.classList.remove("toggled");
        }
    }
    sortGallery(getCategoryId(filter.innerText));
}

function createFilter(name) {
    const filtersContainer = document.getElementById("filters");
    const listElement = document.createElement("li");
    const button = DOMUtils.createElem("button", { innerText: name, classList: "filter", onclick: handleFilterClick });

    if (name.toLowerCase() === defaultFilter.toLowerCase()) button.classList.add("toggled");

    listElement.appendChild(button);
    filtersContainer.appendChild(listElement);
}

async function initGallery() {
    works = await fetchWorks();
    works.forEach((work) => addWorkToGallery(work));
}

async function initFilters() {
    categories = await fetchCategories();
    createFilter(defaultFilter);
    categories.forEach((category) => createFilter(category.name));
}

initGallery();
initFilters();
