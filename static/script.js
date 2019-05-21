function erase() {
    document.getElementById("gold-placeholder").innerHTML = "";
    document.getElementById("qid-placeholder").innerHTML = "";
}

function predict(isSample=false) {
    var quotedFieldList = ['source'];
    var data = {};
    quotedFieldList.forEach(function(fieldName) {
        data[fieldName] = document.getElementById("input-" + fieldName).value;
    })

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/predict');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status == 200) {
            // If you want a more impressive visualization than just
            // outputting the raw JSON, change this part of the code.
            var obj = JSON.parse(xhr.responseText);

            var htmlResults = "<pre-wrap>" + parseDecompositionString(obj.predicted_tokens[0].join(' '),
                "@@SEP@@",false) + "</pre-wrap>";


            document.getElementById("output").innerHTML = htmlResults;

            if (!isSample) {
                erase();
            }
        }
    };
    xhr.send(JSON.stringify(data));
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parseDecompositionString(decompString, line_breaker, hashtag_regex) {
    var parsed = "";
    var parts = decompString.split(line_breaker);
    for (var i = 0; i < parts.length; i++) {
        var formatted;
        if (hashtag_regex) {
            formatted = parts[i].replace(/#(\d\d?)/g, function (x) {
                return "$x" + x.substring(1, x.length);
            });
        } else {
            formatted = parts[i].replace(/@@(\d\d?)@@/g, function (x) {
                return "$x" + x.substring(2, x.length - 2);
            });
        }
        parsed += "x" + (i+1) + " = " + formatted + "<br/>";
    }
    return parsed;
}

function sample(ds_name) {
    var data = {};
    var xhr = new XMLHttpRequest();
    xhr.timeout = 10000;
    xhr.open("GET", "decompositions.csv", true);
    xhr.onload = function() {
        if (xhr.status == 200) {
            var allLines = $.csv.toArrays(xhr.responseText);
            var filteredLines = allLines.filter(line => line[0].startsWith(ds_name));
            var arr = filteredLines[getRandomInt(1, filteredLines.length-1)];

            document.getElementById("input-source").value = arr[1];

            document.getElementById("gold-placeholder").innerHTML = "<div id='gold-label' class='form__field'> " +
                "<label>gold</label></div><div id='gold' class='form__field'>" +
                "<pre-wrap>" + parseDecompositionString(arr[2], ";",true) + "</pre-wrap></div>";

            document.getElementById("qid-placeholder").innerHTML = "<pre-wrap>" + arr[0] + "</pre-wrap>";

            predict(true);
        }
    };

    xhr.send(JSON.stringify(data));
}

function eraseQid() {
    document.getElementById("qid-placeholder").innerHTML = "";
}

function initPage() {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 10000;
    xhr.open("GET", "decompositions.csv", true);

    xhr.onload = function() {
        if (xhr.status == 200) {
            var allLines = $.csv.toArrays(xhr.responseText);
            allLines.shift();

            var allDataSources = new Set(allLines.map(line => line[0].match(/[^_]*/)[0]));

            allDataSources.forEach(dsName => {
                document.getElementById("sample-dropdown").innerHTML +=
                    "<a class=\"dropdown-item\" onclick=\"sample('" + dsName + "')\">" + dsName + "</a>";
            });
        }
    };

    xhr.send();
}

window.onload = initPage;