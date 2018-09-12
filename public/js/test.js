var a = "1";
var e = "0";
var ar = "";
var ae = "";
var n = "";
var c = "";
var arrive="";
var depart="";
var message="";
// var booking = "";
// {
//   adult: a,
//   enfant: e,
//   aeroport: ar,
//   activite: ae,
//   nouriture: n,
//   chambre: c
// };

$(document).ready(function () {
  $("#country").change(function () {
    $.ajax({
      type: 'GET',
      url: "http://localhost:5000/account/test/" + $("#country").val(),
      dataType: 'json'
    })
      .done(function (data) {
        $('#city').contents().remove();
        $('#city').append($('<option>', { value: "", text: "Veuillez choisir votre ville" }));
        data.forEach(city => {
          $('#city').append($('<option>', {
            value: city,
            text: city
          }));
        });

        $("#city").val($("#usercity").val());
      });
  });
  $("#arrive, #depart").change(function () {
     arrive = $("#arrive").val() ? $.datepicker.formatDate("D, d M yy", new Date($("#arrive").val())) : "";
     depart = $("#depart").val() ? $.datepicker.formatDate("D, d M yy", new Date($("#depart").val())) : "";
    $('#textarrive').text(arrive + ' - ' + depart);
  });

  var id = 1;
  $("#next").click(function () {
    id < 3 ? $("#tab" + (++id)).trigger("click") : id;

  });
  $("#pre").click(function () {
    id > 1 ? $("#tab" + (--id)).trigger("click") : id;


  });

  $("span").click(function () {

    if ($("#Adultes").text() != "Adultes") {
      a = $("#Adultes").text();
    }
    if ($("#Enfants").text() != "Enfants") {
      e = $("#Enfants").text();
    }
    c = $("#Chambre").text();
    if (!$("#Aeroport").text().includes("/")) {
      ar = $("#Aeroport").text();
    }
    n = $("#Nourriture").text();
    ae = $("#Activite").text();
    message=$("#message").val();
    // alert(a + e + c + ar + n);
   
    $('#textAeroport').text("").append(" <span class='chk-nights'>Arrivée :</span>	" + ar);
    $('#textNouriture').text(n);
    $('#textActivite').text(ae);
    $('#textchambre').text(c + " Chambre pour").append(" <span class='chk-persons'>" + (parseInt(a) + parseInt(e)) + " personnes</span> ");
    // booking.adult = a;
    // booking.enfant = e;
    // booking.aeroport = ar;
    // booking.activite = ae;
    // booking.nouriture = n;
    // booking.chambre = c;
  });

});

    // $('select>option:eq(3)').prop('selected', true);
    // $('#select_link').click(function (e) {
    //   e.preventDefault();
    //   console.log('select_link clicked');
    //   var data = {};
    //   data.title = "title";
    //   data.message = "message";

    //   $.ajax({
    //     type: 'POST',
    //     data: JSON.stringify(data),
    //     contentType: 'application/json',
    //     url: 'http://localhost:3000/endpoint',
    //     success: function (data) {
    //       console.log('success');
    //       console.log(JSON.stringify(data));
    //     }
    //   });

    // });


