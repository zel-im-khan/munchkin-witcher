const cardPreview            = document.getElementById("card-preview");
const fCardType              = document.getElementById("f-card-type");
const fCardTitle             = document.getElementById("f-card-title");
const fCardSubTitle          = document.getElementById("f-card-subtitle");
const fCardPseudoDescription = document.getElementById("f-card-p-description");
const fCardDescription       = document.getElementById("f-card-description");
const fCardImage             = document.getElementById("f-card-image");
const renderButton           = document.getElementById("render-button");

const cardBgClass           = document.getElementById("card-background-class");
const cardBgRace            = document.getElementById("card-background-race");
const cardBgSymbol          = document.getElementById("card-background-symbol");
const cardTitle             = document.getElementById("card-title");
const cardSubTitle          = document.getElementById("card-subtitle");
const cardPseudoDescription = document.getElementById("card-p-desc");
const cardImageMask         = document.getElementById("card-image-mask");
const cardImage             = document.getElementById("card-image");
const cardDescription       = document.getElementById("card-desc");
const cardType              = document.getElementById("card-type");

const renderedContainer = document.getElementById("rendered-container");
const canvas            = document.getElementById("rendered-image-canvas");
const renderedImage     = document.getElementById("rendered-image");

const CardType = {
    CLASS: "class",
    RACE: "race",
    SYMBOL: "symbol",
};

let currentImage = null;
let cardImageCords = {x: 0, y: 0};

fCardTitle.oninput = function(ev) {
    cardTitle.innerText = fCardTitle.value;
};

fCardSubTitle.oninput = function(ev) {
    cardSubTitle.innerText = fCardSubTitle.value;
};

fCardPseudoDescription.oninput = function(ev) {
    cardPseudoDescription.innerHTML = fCardPseudoDescription.value.replace("\n", "<br>");
};

fCardDescription.oninput = function(ev) {
    cardDescription.innerHTML = fCardDescription.value.replace("\n", "<br>");
};

fCardImage.onchange = function(ev) {
    let imageURL = window.URL.createObjectURL(fCardImage.files[0])

    cardImage.onload = function () {
        cardImageMask.style.width  = this.width  + "px";
        cardImageMask.style.height = this.height + "px";
    };

    cardImage.src = imageURL;
};

fCardType.onchange = function(ev) {
    let selectedOption = this.options[this.selectedIndex].value;

    [cardBgClass, cardBgRace, cardBgSymbol].forEach(function(item) {
        item.style.display = "none";
    });

    if (selectedOption === CardType.CLASS) {
        currentImage = cardBgClass;
        cardType.innerText = "Класс";
    } else if (selectedOption === CardType.RACE) {
        currentImage = cardBgRace;
        cardType.innerText = "Раса";
    } else if (selectedOption === CardType.SYMBOL) {
        currentImage = cardBgSymbol;
        cardType.innerText = "Символ";
    }

    currentImage.style.display = "block";
};

/**
 * So bad code
 * Better use html2canvas library, but this requires a server
 * for rendering images
 */
renderButton.onclick = function(ev) {
    wrapText = function(text, x, y, maxWidth, lineHeight, toDown) {
        let words = text.split(" ");
        let lY = y;
        let line = "";

        let wordsToDown = [];

        for (let wordIndex in words) {
            let word = words[wordIndex];
            let testLine = line + word + " ";
            let measure = context.measureText(testLine);

            if (measure.width > maxWidth && wordIndex > 0) {
                if (!toDown) {
                    wordsToDown.push(line);
                } else {
                    context.fillText(line, x, lY);
                }
                line = word + " ";
                lY += lineHeight;
            } else {
                line = testLine;
            }
        }

        if (!toDown) {
            lY = y - (wordsToDown.length * lineHeight);
            wordsToDown.forEach(item => {
                context.fillText(item, x, lY);
                lY += lineHeight;
            });

            context.fillText(line, x, y);
        } else {
            context.fillText(line, x, lY);
        }
    };

    const cardTextMaxWidth = 268;

    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.drawImage(currentImage, 0, 0);
    context.drawImage(cardImage, cardImageCords.x, cardImageCords.y);

    context.shadowOffsetX = 1;
    context.shadowOffsetY = 1;
    context.shadowColor = "rgba(0, 0, 0, 0.4)";
    context.shadowBlur = 5;

    context.font = "36px Pacifico";
    context.textAlign = "center";
    context.fillStyle = "white";

    let cTitleRect = cardTitle.getBoundingClientRect();
    context.fillText(cardTitle.innerText, canvas.width / 2, cTitleRect.height / 2 + 20);

    context.font = "18px Pacifico";
    let cSubTitleRect = cardSubTitle.getBoundingClientRect();
    context.fillText(cardSubTitle.innerText, canvas.width / 2, cSubTitleRect.height / 2 + cTitleRect.height - 5);

    context.font = "24px Pacifico";
    context.textAlign = "right";
    let cTypeRect = cardType.getBoundingClientRect();
    context.fillText(cardType.innerText, canvas.width - 18, canvas.height - cTypeRect.height / 2);

    context.font = "16px Pacifico";
    context.textAlign = "left";
    wrapText(cardPseudoDescription.innerText, 16, 110, 200, 24, true);

    context.textAlign = "center";
    let cDescRect = cardDescription.getBoundingClientRect();
    wrapText(cardDescription.innerText, canvas.width / 2, canvas.height - 64, cardTextMaxWidth, 24, false);

    renderedImage.src = canvas.toDataURL("image/png");

    renderedContainer.style.top = "0";
};

let needMove = false;
let prevXY = {x: 0, y: 0};

cardImageMask.onmousedown = function(ev) {
    needMove = true;
    prevXY.x = ev.layerX;
    prevXY.y = ev.layerY;
};

cardImageMask.onmouseup = function(ev) {
    needMove = false;
};

cardImageMask.onmousemove = function(ev) {
    if (!needMove) return;

    px = parseInt(cardImageMask.style.left.substr(0, cardImageMask.style.left.length - 2));
    py = parseInt(cardImageMask.style.top .substr(0, cardImageMask.style.top .length - 2));

    px += ev.layerX - prevXY.x;
    py += ev.layerY - prevXY.y;

    cardImageMask.style.left = cardImage.style.left = px + "px";
    cardImageMask.style.top  = cardImage.style.top  = py + "px";

    cardImageCords = {x: px, y: py};
};

renderedContainer.onmousedown = function(ev) {
    if (ev.buttons === 1) {
        renderedContainer.style.top = "-100vw";
    }
};

fCardType.onchange();