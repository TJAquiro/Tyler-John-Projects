import Contact from "./Contact.js";

const formInfo  = document.getElementById("formInfo");
let hasJob = false;

if(hasJob){
    showMessage("Thanks for visiting, I'm currently Employed.")
} 
else{
    showMessage("Please look around, I'm currently looking for a position.")
}

let today = new Date();
let dayOfWeek = today.getDay();

if(dayOfWeek === 0 || dayOfWeek === 6){
    showMessage("Since it is the weekend, please be patient with my returning your email.")

}

function showMessage(message){
    formInfo.innerHTML = "<p>" + message + "</p>";
}

function clearMessage(message){
    formInfo.innerHTML = "";
}

const contactForm = document.getElementById("contactForm")
contactForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const contact = new Contact(contactForm);
    contact.send();
})

const experiences = document.getElementsByClassName("experience")
for (let x = 0; x < experiences.length; x++){
    const item = experiences[x];
    item.addEventListener("mouseenter", function (event) {
        event.target.style = "background-color:rgb(206, 206, 206)"
    });
    item.addEventListener("mouseleave", function (event) {
        event.target.style = ""
    });
}
