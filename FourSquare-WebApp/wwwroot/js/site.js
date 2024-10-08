var mode = 0;
var lastInput;
var lastOutput;

var ctrlDown = false;

gridMoveRight = (gridName, element) => {
    var elementIndex = $(element).parent().attr('index').split(',');
    var row = elementIndex[0];
    var col = elementIndex[1];

    var nextRow;
    var nextCol;

    if (col == 4) {
        nextCol = 0;
        nextRow = row == 4 ? 0 : parseInt(row) + 1;
    }
    else {
        nextRow = row;
        nextCol = parseInt(col) + 1;
    }

    var nextElement = $(`#${gridName} .col[index="${nextRow},${nextCol}"] input`)[0];
    nextElement.focus();
}

gridMoveLeft = (gridName, element) => {
    var elementIndex = $(element).parent().attr('index').split(',');
    var row = elementIndex[0];
    var col = elementIndex[1];

    var nextRow;
    var nextCol;

    if (col == 0) {
        nextCol = 4;
        nextRow = row == 0 ? 4 : parseInt(row) - 1;
    }
    else {
        nextRow = row;
        nextCol = parseInt(col) - 1;
    }

    var nextElement = $(`#${gridName} .col[index="${nextRow},${nextCol}"] input`)[0];
    nextElement.focus();
}

gridMoveUp = (gridName, element) => {
    var elementIndex = $(element).parent().attr('index').split(',');
    var row = elementIndex[0];
    var col = elementIndex[1];

    var nextRow;
    var nextCol;

    if (row == 0) {
        nextCol = col;
        nextRow = 4;
    }
    else {
        nextRow = parseInt(row) - 1;
        nextCol = col;
    }

    var nextElement = $(`#${gridName} .col[index="${nextRow},${nextCol}"] input`)[0];
    nextElement.focus();
}

gridMoveDown = (gridName, element) => {
    var elementIndex = $(element).parent().attr('index').split(',');
    var row = elementIndex[0];
    var col = elementIndex[1];

    var nextRow;
    var nextCol;

    if (row == 4) {
        nextCol = col;
        nextRow = 0;
    }
    else {
        nextRow = parseInt(row) + 1;
        nextCol = col;
    }

    var nextElement = $(`#${gridName} .col[index="${nextRow},${nextCol}"] input`)[0];
    nextElement.focus();
}

encrypt = () => {
    var plaintext = $('#inputText').val();
    var simplifiedPlaintext = plaintext.replace(/[^a-zA-Z]/g, '');
    var message = simplifiedPlaintext.padEnd(Math.ceil(simplifiedPlaintext.length / 2) * 2, 'X').toUpperCase().replace(/\Q/g, 'K');

    var upperLeftGrid = $('#upperLeftGrid');
    var upperRightGrid = $('#upperRightGrid');
    var lowerLeftGrid = $('#lowerLeftGrid');
    var lowerRightGrid = $('#lowerRightGrid');

    var encryptedMessageChars = [];
    var pointer = 0;

    while (pointer < message.length) {
        var upperLeftCoords = upperLeftGrid.find(`input[value="${message.charAt(pointer).toLowerCase()}"]`).closest('.col').attr('index');
        var lowerRightCoords = lowerRightGrid.find(`input[value="${message.charAt(pointer + 1).toLowerCase()}"]`).closest('.col').attr('index');

        var alpha = upperLeftCoords.split(',')[0];
        var beta = upperLeftCoords.split(',')[1];
        var gamma = lowerRightCoords.split(',')[0];
        var delta = lowerRightCoords.split(',')[1];

        encryptedMessageChars.push(upperRightGrid.find(`.col[index="${alpha},${delta}"] input`).val());
        encryptedMessageChars.push(lowerLeftGrid.find(`.col[index="${gamma},${beta}"] input`).val());

        pointer = pointer + 2;
    }

    lastInput = plaintext;
    lastOutput = encryptedMessageChars.join("");
    $('#outputText').val(encryptedMessageChars.join(""));
}

decrypt = () => {
    var inputText = $('#inputText').val();
    if (inputText.match(/([^a-zA-Z]|[Qq])/g,)) {
        alert("Not a valid cipher. Please remove special characters and Q (replace with K)");
        return;
    }
    var cipherText = inputText.toUpperCase();

    var upperLeftGrid = $('#upperLeftGrid');
    var upperRightGrid = $('#upperRightGrid');
    var lowerLeftGrid = $('#lowerLeftGrid');
    var lowerRightGrid = $('#lowerRightGrid');

    var plaintextChars = [];
    var pointer = 0;

    while (pointer < cipherText.length) {
        var upperRightCoords = upperRightGrid.find(`input[value="${cipherText.charAt(pointer).toUpperCase()}"]`).closest('.col').attr('index');
        var lowerLeftCoords = lowerLeftGrid.find(`input[value="${cipherText.charAt(pointer + 1).toUpperCase()}"]`).closest('.col').attr('index');

        var alpha = upperRightCoords.split(',')[0];
        var beta = upperRightCoords.split(',')[1];
        var gamma = lowerLeftCoords.split(',')[0];
        var delta = lowerLeftCoords.split(',')[1];

        plaintextChars.push(lowerRightGrid.find(`.col[index="${alpha},${delta}"] input`).val());
        plaintextChars.push(upperLeftGrid.find(`.col[index="${gamma},${beta}"] input`).val());

        pointer = pointer + 2;
    }

    lastInput = inputText;
    lastOutput = plaintextChars.join("");
    $('#outputText').val(plaintextChars.join(""));
}

$(document).on('keydown', (evt) => {
    if (evt.key == "Control") ctrlDown = true;
}).on('keyup', (evt) => {
    if (evt.key == "Control") ctrlDown = false;
})

$('.gridContainer input').on('keydown', (evt) => {
    var currentGrid = $(evt.target).closest('.gridContainer');
    var gridName = currentGrid.attr('id');
    
    var currentValue = $(evt.target).val();
    var newValue;
    var pattern = "^[A-Za-z]{1}$";
    var regex = new RegExp(pattern);

    if (evt.key == "Tab" || evt.key == "Escape") {
        return;
    }

    if (evt.key == "ArrowRight") {
        gridMoveRight(gridName, evt.target);
        return;
    }

    if (evt.key == "ArrowLeft") {
        gridMoveLeft(gridName, evt.target);
        return;
    }

    if (evt.key == "ArrowUp") {
        gridMoveUp(gridName, evt.target);
        return;
    }

    if (evt.key == "ArrowDown") {
        gridMoveDown(gridName, evt.target);
        return;
    }

    if (!evt.key.match(regex) || evt.key.toUpperCase() == "Q" || ctrlDown) {
        evt.preventDefault();
        return;
    }

    if ($(currentGrid).hasClass('plainGridContainer')) newValue = evt.key.toLowerCase();
    else newValue = evt.key.toUpperCase();
    $(`#${gridName} input[value=${newValue}]`).attr('value', currentValue);
    $(evt.target).attr('value', newValue);

})

$('#runButton').on('click', () => {
    if (mode == 0) encrypt();
    else decrypt();
})

$('#outputText').on('keydown', (evt) => {
    var arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];
    var controlUtilityKeys = ["C", "c", "F", "f"];
    if (!arrowKeys.includes(evt.key) && !(ctrlDown && controlUtilityKeys.includes(evt.key))) {
        evt.preventDefault();
        return;
    }
})

$('#switchButton').on('click', () => {
    if (mode == 0) {
        mode = 1;
        $('#runButton').html("Decrypt");
        var input = $('#inputText').val();
        var output = $('#outputText').val();

        if (lastInput != undefined && lastOutput != undefined) {
            $('#outputText').val(lastInput);
            $('#inputText').val(lastOutput);
        }
        $('#outputText').attr("placeholder", "Your decrypted text will show here");
        $('#inputText').attr("placeholder", "Insert your ciphertext here");
    }
    else {
        mode = 0;
        $('#runButton').html("Encrypt");
        var input = $('#inputText').val();
        var output = $('#outputText').val();

        if (lastInput != undefined && lastOutput != undefined) {
            $('#outputText').val(lastInput);
            $('#inputText').val(lastOutput);
        }
        $('#outputText').attr("placeholder", "Your encrypted text will show here");
        $('#inputText').attr("placeholder", "Insert your plaintext here");
    }
})