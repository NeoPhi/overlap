var alertError = _.template($('#alertError').html());
var castRow = _.template($('#castRow').html());

var casts = {};

var renderCast = function(targetField, castNames) {
  var target = $(targetField);
  var html = '';
  _.each(castNames, function(castName) {
    var castSearch = castName.replace(/\s\([^\)]+\)/g, '');
    html += castRow({
      castName: castName,
      castSearch: encodeURIComponent(castSearch).replace(/%20/g, '+')
    });
  });
  target.html(html);
};

var renderOverlap = function() {
  if (_.keys(casts).length !== 2) {
    return $('#overlapResults').empty();
  }
  var overlapNames = _.intersection(casts.cast1, casts.cast2);
  renderCast('#overlapResults', overlapNames);
};

var loadData = function(castField, titleNameField, targetField) {
  var titleName = $(titleNameField).val();
  if (titleName.length < 1) {
    return;
  }
  $.ajax({
    url: '/api/titles/' + encodeURIComponent(titleName) + '/cast/',
    error: function(jqXHR, textStatus, errorThrown) {
      $(targetField).html(alertError({
        message: errorThrown
      }));
      delete casts[castField];
    },
    success: function(data, textStatus, jqXHR) {
      if (data.result) {
        renderCast(targetField, data.result);
        casts[castField] = data.result;
      } else {
        delete casts[castField];
      }
    },
    complete: function(jqXHR, textStatus) {
      renderOverlap();
    }
  });
};

_.each(_.range(1, 3), function(index) {
  var loader = function() {
    loadData('cast' + index, '#title' + index + 'SearchText', '#title' + index + 'Results');
  };

  $('#title' + index + 'SearchText').keyup(function(event){
    if (event.keyCode === 13) {
      loader();
    }
  });

  $('#title' + index + 'SearchButton').click(function() {
    loader();
  });
});
