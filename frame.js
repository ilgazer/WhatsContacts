const frame = document.createElement("iframe");
const frameUrl = "https://ilgazer.github.io/whatsapp-to-contact-tag/people";
frame.setAttribute("src", frameUrl);
document.body.appendChild(frame);

window.addEventListener("message", receiveMessage, false);

let parentWindow;
function receiveMessage(event) {
    console.log(event);
    if (event.data.command) {
        parentWindow=event.source;
        frame.contentWindow.postMessage(event.data, "*");
    }else if(event.data.resp){
        parentWindow.postMessage(event.data, "*");
    }
}