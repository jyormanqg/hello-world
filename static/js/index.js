$(document).ready(function() {
  var $rutaArchivo = $('#rutaArchivo');
  var $btnContinuar = $('#btnContinuar');

  $rutaArchivo.on('input', function() {
    if ($rutaArchivo.val().trim() !== '') {
      $btnContinuar.prop('disabled', false);
    } else {
      $btnContinuar.prop('disabled', true);
    }
  });
});



$(document).ready(function() {
  $('#btnContinuar').click(function() {
    var rutaArchivo = $('#rutaArchivo').val();

    $.ajax({
      url: '/process',
      type: 'POST',
      data: { rutaArchivo: rutaArchivo },
      success: function(response) {
        window.location.href = '/resultados?archivo=' + response.nombre_archivo;
      },
      error: function(error) {
        console.log(error);
      }
    });
  });
});