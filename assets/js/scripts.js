// Create listener for the parse button click
$("#parseBtn").click(function () {
    var files = document.getElementById('files').files;
    if (!files.length) {
        alert('Please select a file!');
        return;
    }
    readBlob(files[0]);
});

var bib;
var tags = ["journal", "publisher", "year"]

function handleFileSelect(evt){
    evt.stopPropagation();
    evt.preventDefault();
    
    var files = evt.dataTransfer.files;
    readBlob(files[0]);

    $("#file_name").text(files[0].name);

    $("#journal-link").click();
}

//Read the file
function readBlob(file) {
    var start = 0;
    var stop = file.size - 1;
    var reader = new FileReader();
    reader.onloadend = function (evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2       
            bib = bibtexParse.toJSON(evt.target.result);
            // Create a graph from the bib
            for(t of  tags){
              Graph(bib, t);
            }
            
            //Graph(bib, "publisher");
        }
    };
    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
}

// Gets data from the bibtex file according to the specified
// EntryTag, which is used as a filter. Returns it as a data
// object, which is an array of objects that have label=>value
function GetGraphData(bib, entryTag) {
    var entries = [];
    for (i = 0; i < bib.length; i++) {
        var entryTags = bib[i]["entryTags"];
        var entry = entryTags[entryTag];

        if (entry != undefined) {
            if (isNaN(entries[entry]))
                entries[entry] = 1;
            else
                entries[entry]++;
        }
    }

    //Covert the data into the format expected by highcharts
    var labels = Object.keys(entries);
    var values = Object.values(entries);
    var data = [];

    for (i = 0; i < values.length; i++) {
        if (values[i] > 1) {
            var t = {
                name : labels[i],
                y : values[i]
            }
            data.push(t);
        }
    }

    //Sort the data
    data.sort(function(a, b){return a.y - b.y}); 
    data.reverse();
    console.log(data);
    // data[0].slice = true;
    // data[0].selected = true;

    return data;
}

function Graph(bib, entryTag) {
    var data = GetGraphData(bib, entryTag);

    Highcharts.chart(entryTag + '-container', {
        chart: {
            backgroundColor: '#FCFCFC',
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
        },
        title: {
          text: 'Share of publications by ' + entryTag
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            floating: false,
            backgroundColor: '#FFFFFF',
            width: "30%"
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: false
            },
            showInLegend: true
          }
        },
        series: [{
          type: 'pie',
        
          innerSize: '50%',
          name: 'Percentage of Publications',
          colorByPoint: true,
          data: data
        }]
      });
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);