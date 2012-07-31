var alertError = _.template($('#alertError').html());
var castRow = _.template($('#castRow').html());
var titleRow = _.template($('#titleRow').html());

var casts = {};

var renderCast = function(castField, castNames) {
  var target = $(castField);
  var html = '';
  _.each(castNames.sort(), function(castName) {
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
    return $('#overlapCast').empty();
  }
  var overlapNames = _.intersection(casts.cast1, casts.cast2);
  renderCast('#overlapCast', overlapNames);
};

var loadCast = function(titleId, targetField, castId) {
  if (titleId.length < 1) {
    return;
  }
  $.ajax({
    url: '/api/titles/' + titleId + '/cast/',
    error: function(jqXHR, textStatus, errorThrown) {
      $(targetField).html(alertError({
        message: errorThrown
      }));
    },
    success: function(data, textStatus, jqXHR) {
      if (data.result) {
        renderCast(targetField, data.result);
        casts[castId] = data.result;
      }
    },
    beforeSend: function(jqXHR, settings) {
      delete casts[castId];
    },
    complete: function(jqXHR, textStatus) {
      renderOverlap();
    }
  });
};

var renderTitles = function(titleResultsField, results, castIndex) {
  var select = $('<select>');
  var html = titleRow({
    value: '',
    option: 'Showing ' + results.titles.length + ' of ' + results.totalMatchesFound
  });
  _.each(results.titles, function(title) {
    html += titleRow({
      value: title.id,
      option: title.name + ' (' + title.year + ') (' + title.type + ')'
    });
  });
  select.html(html);
  select.change(function() {
    loadCast(select.val(), '#title' + castIndex + 'Cast', 'cast' + castIndex);
  });
  $(titleResultsField).empty().append(select);
};

var titleSearch = function(titleNameField, titleResultsField, castIndex) {
  var titleName = $(titleNameField).val();
  if (titleName.length < 1) {
    return;
  }
  $.ajax({
    url: '/api/titles/',
    data: {
      query: titleName
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $(titleResultsField).html(alertError({
        message: errorThrown
      }));
    },
    success: function(data, textStatus, jqXHR) {
      if (data.result) {
        renderTitles(titleResultsField, data.result, castIndex);
      } else {
        $(titleResultsField).html(alertError({
          message: data.err
        }));
      }
    },
    complete: function() {
      delete casts['cast' + castIndex];
      $('#title' + castIndex + 'Cast').empty();
      renderOverlap();
    }
  });
};

_.each(_.range(1, 3), function(index) {
  var loader = function() {
    titleSearch('#title' + index + 'SearchText', '#title' + index + 'Results', index);
  };

  $('#title' + index + 'SearchText').keyup(function(event){
    if (event.keyCode === 13) {
      loader();
    }
  });

  $('#title' + index + 'SearchButton').click(loader);
});

