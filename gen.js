var gen = {};

//::QaMap->Iso8601d->Html
gen.qa_report = function(qa_map, day) {
  var day_before, diff, xs, m, table_html, html, html_body;
  day_before = D_I(I_D(day) - 1);
  diff = gen.qa_days_diff(qa_map, day_before, day);
  if (keys(diff).length == 0) {return 'Previous day is missing in the QA map';}
  xs = ['om', 'archive'].map(function(g) {
    var ys;
    ys = ['valid', 'invalid'].map(function(s) {
      var res, value, sgn, s_sig, cls;
      value = diff[g][s];
      sgn = sign(value);
      if (s == 'valid') {
        if (sgn > 0) {cls = 'positive';} else if (sgn < 0) {cls = 'negative';} else {cls = 'neutral';};
      } else {
        if (sgn > 0) {cls = 'negative';} else if (sgn < 0) {cls = 'positive';} else {cls = 'neutral';};
      }
      s_sig = g_or_eq_sign(sgn);
      res = qa_map[day][g][s];
      res += wrap.in_tag('span', {class : 'superscript ' + cls}, '(' + s_sig + value + ')');
      return res;
    });
    return [g].concat(ys);
  });

  xs.unshift(['', 'Valid', 'Invalid']);
  table_html = gen.html_table(xs);
  html_body = wrap.in_tag('body', {}, table_html);
  var css = '.superscript {vertical-align: top; font-size:0.6em}';
  css += '.positive {color:green;}';
  css += '.negative {color:red;}';
  var style = wrap.in_tag('style', {} , css);
  var html_header = wrap.in_tag('head', {}, style);
  html = html_header + html_body;
  return html;
};

//::QaMap->Iso8601d->Iso8601d->{:valid :invalid}
gen.qa_days_diff = function(qa_map, day1, day2) {
  var res;
  res = {};
  if (qa_map[day1] && qa_map[day2]) {
    keys(qa_map[day1])/*om&archive*/.map(function(p) {
      res[p] = {};
      keys(qa_map[day1][p])/*valid&invalid*/.map(function(s) {
        res[p][s] = qa_map[day2][p][s] - qa_map[day1][p][s];
      });
    });
  }
  return res;
};

gen.qa_map = function(vh) {
  var res;
  res = {};
  vh.forEach(function(h) {
    var day, group;
    group = h['group'];
    day = J_I(h['timestamp']);
    blow(res, day, {});
    blow(res[day], group, {});
    res[day][group].valid = h['valid'];
    res[day][group].invalid = h['invalid'];
  });
  return res;
};

gen.html_table = function(m) {
  var rows;
  rows = m.map(function(r) {
    var tds;
    tds = r.map(function(x) {return wrap.in_tag('td', {}, x);});
    return wrap.in_tag('tr', {}, tds.join(''));
  }).join('');
  return wrap.in_tag('table', {}, rows);
};

//::[OMTableRecord]->{<iso8601d>:[OMTableRecord]}
gen.daily_map = function(xs) {
  var res, day;
  res = {};
  xs.forEach(function(x) {
    var day;
    day = J_I(x['Date']);
    blow(res, day, []);
    res[day].push(x);
  });
  return res;
};