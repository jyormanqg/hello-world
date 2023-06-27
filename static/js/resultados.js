const config = {}

$(document).ready(function() {
    var xhr;
    var columnName;

    /* Feature visualization */
    $(".btn-visualize").click(function() {
        // Llamada asincrónica a la función
        columnName = $(this).attr("value");
        xhr = $.ajax({
            url: '/visualize_column',
            type: 'POST',
            data: { 
                filePath    : $("#file-path").attr("value"), 
                columnName  : columnName,
                columnDtype : $(this).attr("dtype")
            },
            beforeSend: function() {
                // Mostrar el div de carga
                $('#loading-column').text(columnName);
                $("#modal-title").text(columnName);
                $('#loadingOverlay').show();
            },
            success: function(response) {
                console.log(response)
                $('#myModal').modal('show');
                $('#modalImage').attr('src', response.chartPath);
            },
            error: function(error) {
              console.log(error);
            },
            complete: function() {
                // Hidde the modal once the ajax request is completed
                $('#loadingOverlay').hide();
            }
        });
    });

    $('#cancelButton').click(function() {
        // Cancel ajax petition
        if (xhr) {
          xhr.abort();
        }
    });

    /* Banding Setup */
    $(".btn-banding").click(function() {
        var columnName = $(this).attr("value");
        reset_modal_banding();
        $('#bandingModal').modal('show');
        $("#bmodal-title").text(columnName);
        if (config[columnName]) {
            load_actual_banding(columnName);
        }
    });

    // Add Range button
    $(document).on("click", ".btn-add-range", function() {
        var newRange = add_range();
        $(this).parent().append(newRange);
    });

    // Remove Range button (delegado)
    $(document).on("click", ".btn-remove-range", function() {
        $(this).parent().remove();
    });

    // Add Special button
    $(document).on("click", ".btn-add-special", function() {
        var newElement = add_special();
        $(this).parent().append(newElement);
    });

    // Save config
    $("#btn-save-banding").click(function() {
        get_config();
    });





    /* Load configuration */
    $("#btn-load-config").click(function() {
        alert('Load configuration...')
      });


    /* Simulate Bandings */
    $(".btn-simulate-bandings").click(function() {
        columnName = $(this).attr("value");
        var xhr;
        if (config[columnName]) {
            xhr = $.ajax({
                url: '/simulate_banding',
                type: 'POST',
                data: { 
                    filePath    : $("#file-path").attr("value"), 
                    columnName  : columnName,
                    columnDtype : $(this).attr("dtype"),
                    config      : JSON.stringify(config[columnName])
                },
                beforeSend: function() {
                    // Mostrar el div de carga
                    $('#loading-column').text(columnName);
                    $("#modal-title").text(columnName);
                    $('#loadingOverlay').show();
                },
                success: function(response) {
                    if (response.status === 200) {
                        console.log(response)
                        $('#myModal').modal('show');
                        $('#modalImage').attr('src', response.chartPath);
                    } else {
                        show_alert(columnName, response.message);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Error" + jqXHR.responseText); // Imprimir el mensaje de error en la consola
                    alert('Error en la solicitud: ' + errorThrown); // Mostrar un mensaje de error al usuario
                },
                complete: function() {
                    // Hidde the modal once the ajax request is completed
                    $('#loadingOverlay').hide();
                }
            });
        } else {
            // Show column name in the alert
            show_alert(columnName, "You don't have any banding for the column:");
          }
    })



});



function show_alert(columnName, mssg, duration = 3000) {
    var alertContent = `
                <div class="alert alert-warning alert-dismissible fade show" role="alert" style="position: fixed; top: 5%; left: 50%; transform: translate(-50%, -50%);">
                <strong>${mssg} </strong> ${columnName}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
        `;
    $('body').append(alertContent);
    setTimeout(function() {
        $('.alert').alert('close');
    }, duration);
}


function reset_modal_banding() {
    $(".modal-banding-body").empty();
    var ehtml = `
        <!-- Range -->
        <div id="div-ranges">
            <div class="input-group mb-2">
                <div class="input-group-prepend w-25">
                    <span class="input-group-text w-100" id=""><strong>Range </strong></span>
                </div>
                <button class="btn btn-outline-success btn-add-range" type="button"><i class="fas fa-plus"></i> Add</button>
            </div>
        </div>
        <!-- End Range -->
        <!-- Special section -->
        <div id="div-special">
            <div class="input-group mb-2">
            <div class="input-group-prepend w-25">
                <span class="input-group-text w-100" id=""><strong>Special </strong></span>
            </div>
            <button class="btn btn-outline-success btn-add-special" type="button"><i class="fas fa-plus"></i> Add</button>
            </div>
        </div>
        <!-- End Special section -->
    `;
    $(".modal-banding-body").append(ehtml);
}

function add_range(start = 1, end = 100, step = 10) {
    var ehtml = `
        <!-- Range -->
        <div class="input-group mt-2 ranges-indiv">
            <div class="input-group-prepend">
                <span class="input-group-text" name="range">range</span>
            </div>
            <input type="number" class="form-control" name="range-start" placeholder="Start value: 1" value=${start}>
            <input type="number" class="form-control" name="range-end" placeholder="End value: 100" value=${end}>
            <input type="number" class="form-control" name="range-step" placeholder="Step: 10" value=${step}>
            <button class="btn btn-outline-danger btn-remove-range" type="button"><i class="fas fa-minus"></i> Remove</button>  
        </div>
        <!-- End Range -->
    `;
    return ehtml;
};

function add_special(label = 'Unknown', value = 'np.inf') {
    var ehtml = `
        <!-- Special -->
        <div class="input-group mt-2 special-indiv">
            <div class="input-group-prepend">
                <span class="input-group-text" name="special">special</span>
            </div>
            <input type="text" class="form-control" name="sp-banding-label" value=${label}>
            <input type="text" class="form-control" name="sp-banding-value" value=${value}>
            <button class="btn btn-outline-danger btn-remove-range" type="button"><i class="fas fa-minus"></i> Remove</button>  
        </div>
        <!-- End special -->
    `;
    return ehtml;
};

function get_config() {
    var columnName = $("#bmodal-title").text()
    var configTmp  = {['special'] : {}}

    var elements   = $(".ranges-indiv");
    if (elements.length > 0) {
        elements.each(function(index, element) {
            var rangeStart = $(element).find('[name="range-start"]').val();
            var rangeEnd   = $(element).find('[name="range-end"]').val();
            var rangeStep  = $(element).find('[name="range-step"]').val();
            configTmp[`range_${index}`] = [parseFloat(rangeStart), parseFloat(rangeEnd)]
            configTmp[`step_${index}`] = parseFloat(rangeStep)
        });
    };

    var specials = $(".special-indiv");
    if (specials.length > 0) {
        specials.each(function(index, element) {
            var spBandingLevel = $(element).find('[name="sp-banding-label"]').val();
            var spBandingBin   = $(element).find('[name="sp-banding-value"]').val();
            configTmp['special'][`${spBandingLevel}`] = parseValue(spBandingBin);
        });
    };
    config[columnName] = configTmp
};

function load_actual_banding(columnName) {
    var configColumn = config[columnName]
    for (var key in configColumn) {
        if (key.startsWith('range_')) {
          var idx = key.split('_')[1];
          var range = configColumn[`range_${idx}`]
          var step  = configColumn[`step_${idx}`]
          $(".btn-add-range").parent().append(add_range(range[0], range[1], step));

        } else if (key === 'special') {
            $.each(configColumn[key], function(k, v) {
                $(".btn-add-special").parent().append(add_special(k, v));
            });
        }
      }
};


function parseValue(value) {
    if (value === "np.inf") {
      return value; // Retorna el valor tal cual si es "np.inf"
    } else {
      return JSON.parse(value); // Convierte la cadena en una lista de números
    }
  }


/* Save configuration */
function saveConfig() {
    var jsonData = JSON.stringify(config, null, 2); // Indentación de 2 espacios
    var blob = new Blob([jsonData], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    
    $('<a />')
      .attr('href', url)
      .attr('download', 'config.json')
      .appendTo('body')
      .get(0)
      .click();
    
    URL.revokeObjectURL(url);
  }
  
  $(document).ready(function() {
    $("#btn-save-config").click(function() {
      saveConfig();
    });
});