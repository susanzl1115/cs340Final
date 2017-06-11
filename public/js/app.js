$(document).ready(function(){

  $('#reset').on('click', function(){
    $('form input').not('button').each(function(ind, elem){
      $(elem).val("");
    })
  });

  $(document.body).on('click', '.deleteRow', function(){
    var sendId = $(this).parent()
                        .parent()
                        .children()
                        .filter('.id')[0];
    var sendData = {};
    sendData.id = $(sendId).text();
    sendData.table = $(location).attr('href');
    sendData.table = sendData.table.substr(sendData.table.lastIndexOf('/') + 1);
    console.log(sendData);

    $.ajax({
      method:"DELETE",
      url:"delete-row",
      data: sendData
    }).done(function(data){
      var selectRow = '#row'+data;
      $(selectRow).remove();
    });
  });

  $(document.body).on('click', '.editRow', function(){
    var grabRow = $(this).parent().parent().children();
    $(grabRow).each(function(ind, elem){
      var elementText = $(elem).text();
      if($(elem).hasClass('id')){
        return;
      }
      else if ($(elem).hasClass('edit-buttons')) {
        $(elem).children()
               .filter('.editRow')
               .removeClass('editRow')
               .addClass('updateRow')
               .text("Update");
      }
      else {
        if ($(elem).hasClass('class')){
          var setHTML = "<select class='form-control' name='' class='class'>"+
                        "<option value='Bulbasaur'>Bulbasaur</option>"+
                        "<option value='Charmander'>Charmander</option>"+
                        "<option value='Squirtle'>Squirtle</option>"+
                        "<option value='Caterpie'>Caterpie</option>"+
                        "<option value='Metapod'>Metapod</option>"+
                        "<option value='Weedle'>Weedle</option>"+
                        "<option value='Kakuna'>Kakuna</option>"+
                        "<option value='Pidgey'>Pidgey</option>"+
                        "<option value='Rattata'>Rattata</option>"+
                        "<option value='Spearow'>Spearow</option>"+
                        "</select>";
          $(elem).html(setHTML);
        }
        else if(!(parseInt(elementText, 10) > -1)){
          var setHTML = "<input type='text' class='form-control' value='"+
                        elementText +
                        "'/>";
          $(elem).html(setHTML);
        }
        else {
          var setHTML = "<input type='number' class='form-control' value='"+
                        elementText +
                        "'/>";
          $(elem).html(setHTML);
        }
      }
    })
  });

  $(document.body).on('click', '.updateRow', function(){
    var sendData = {};
    sendData.columns = {};
    $(this).parent()
           .parent()
           .children()
           .not('.edit-buttons')
           .each(function(ind,elem){
             $(elem).children().removeClass('has-error');
              if($(elem).children().val() == ''){
                $(elem).children().addClass('has-error');
              }
              else {
                if( $(elem).hasClass('id')){
                  sendData[$(elem).attr('class')] = $(elem).text();
                }
                else {
                  sendData.columns[$(elem).attr('class')] = $(elem).children().val();
                }
              }
    });
    sendData.table = $(location).attr('href');
    sendData.table = sendData.table.substr(sendData.table.lastIndexOf('/') + 1);
    console.log(sendData);

    $.ajax({
      method:"POST",
      url:"update-row",
      data: sendData
    }).done(function(data){
      var selectRow = "#row" + data.id;
      $(selectRow).children()
                  .not('.id')
                  .each(function(ind, elem){
                    if ($(elem).hasClass('edit-buttons')) {
                      $(elem).children()
                             .filter('.updateRow')
                             .removeClass('updateRow')
                             .addClass('editRow')
                             .text("Edit");
                    }

                    else {
                      for(var key in data.columns){
                        if($(elem).hasClass(key)){
                          $(elem).html(data.columns[key]);
                        }
                      }
                    }
                  });
    });
  });

  $(document.body).on('click', '#addRow', function(){
    var sendData = {};
    var dataSafe = true;
    sendData.columns = {};
    sendData.table = $(location).attr('href');
    sendData.table = sendData.table.substr(sendData.table.lastIndexOf('/') + 1);
    console.log(sendData);
    $(this).parent()
           .parent()
           .children()
           .not('.edit-buttons')
           .children()
           .each(function(ind,elem){
             $(elem).parent()
                    .removeClass('has-error');
             var key = $(elem).attr('id').substr(3);
             if($(elem).val() == ''){
               dataSafe = false;
               $(elem).parent()
                      .addClass('has-error');
             }
             sendData.columns[key] = $(elem).val();
           });
    if(dataSafe){
      $.ajax({
        method:"POST",
        url:"add-row",
        data: sendData
      }).done(function(data){
        location.reload();
      });
    }
    else {
      return;
    }
  });
});