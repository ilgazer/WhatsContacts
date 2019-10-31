const frame = document.createElement("iframe");
const frameUrl = chrome.runtime.getURL('frame.html');
frame.setAttribute("src", frameUrl);
document.body.appendChild(frame);
let peopleWindow = frame.contentWindow;
let insertedGroupButton = false;

document.addEventListener("click", onDocumentClick);

async function onDocumentClick() {
    await sleep(1000);
    if (checkGroupOpened()) {
        if (!insertedGroupButton) {
            insertGroupButtons();
            insertedGroupButton = true;
        }
    } else {
        insertedGroupButton = false;
    }
}

function checkGroupOpened() {
    let xpath = "//div[text()='Group info']";
    let query = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return query.singleNodeValue !== null;
}

function insertGroupButtons() {
    let xpath = "//span[text()='Starred Messages']";
    let starredButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    let groupButton = document.createElement("span");
    groupButton.classList.add(starredButton.classList[0]);
    groupButton.innerText = "Make Contacts Tag ";
    let input = document.createElement("input");
    input.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            onMakeTag(event.target.value);
        }
    });
    groupButton.appendChild(input);

    let contactButton = document.createElement("span");
    contactButton.classList.add(starredButton.classList[0]);
    contactButton.innerText = "Add To Contacts";

    while (starredButton.getAttribute("role") !== "button") {
        starredButton = starredButton.parentElement;
        let newerGroup = document.createElement("div");
        newerGroup.classList.add(starredButton.classList[0]);
        newerGroup.appendChild(groupButton);
        groupButton = newerGroup;

        let newerContact = document.createElement("div");
        newerContact.classList.add(starredButton.classList[0]);
        newerContact.appendChild(contactButton);
        contactButton = newerContact;
    }
    groupButton.setAttribute("role", "button");
    starredButton.parentElement.appendChild(groupButton);

    contactButton.setAttribute("role", "button");
    contactButton.addEventListener("click", () => getNumbersWithName().then(console.log));
    starredButton.parentElement.appendChild(contactButton);
}

async function onMakeTag(tag) {
    peopleWindow.postMessage({
        command: "addPeopleFromNameList",
        args: [
            tag,
            await getNames()
        ]
    }, "*");
}

async function getNames() {
    document.body.style.zoom = "1%";
    await sleep(1000);
    let youSpan = document.querySelector("span[title=You]");
    let peopleParent = youSpan.parentElement;
    while (peopleParent.children.length === 1 || !Array.from(peopleParent.children)
            .map(elem => elem.classList[0])
            .every((val, i, arr) => val === arr[0])
        ) {
        peopleParent = peopleParent.parentElement;
    }
    console.log(peopleParent);

    let names = Array.from(peopleParent.children).map(child => child.getElementsByClassName(youSpan.classList[0])[0].innerText);

    document.body.style.zoom = "100%";

    return names;
}

async function getNumbersWithName() {
    document.body.style.zoom = "1%";
    await sleep(1000);
    let youSpan = document.querySelector("span[title=You]");
    let peopleParent = youSpan.parentElement;
    while (peopleParent.children.length === 1 || !(Array.from(peopleParent.children)
        .map(elem => elem.classList[0])
        .every((val, i, arr) => val === arr[0]))) {
        peopleParent = peopleParent.parentElement;
    }
    console.log(peopleParent);

    let names = Array.from(peopleParent.children).map(child => [
        Array.from(child.querySelectorAll("span"))
            .find(span => window.getComputedStyle(span, ":before").content === '"~"'), child])
        .filter(([nameElem]) => nameElem)
        .map(([nameElem, child]) => ({
            name: nameElem.querySelector("span").innerText,
            phone: child.getElementsByClassName(youSpan.classList[0])[0].innerText
        }));

    document.body.style.zoom = "100%";

    return names;
}


const sleep = m => new Promise(r => setTimeout(r, m));
