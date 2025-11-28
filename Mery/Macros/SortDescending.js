#language = "quickjs"
#title = "降順に並べ替え (Z から A)"
#tooltip = "選択範囲または文書全体を降順に並べ替えます。"
#include "Common.js"
/*
Copyright (c) Kuro. All rights reserved.
Licensed under the MIT License.
*/
var sel = document.selection;
var isEmpty = sel.isEmpty;
if (isEmpty) {
	sel.SelectAll();
}
doMultiEdit(function() {
	sel.Text = sel.Text.replace(/\n?$/, '').split('\n').sort(function(a, b){ return ((a < b) ? 1 : ((a > b) ? -1 : 0)) }).join('\n') + (sel.Text.endsWith('\n') ? '\n' : '');
}, !isEmpty);
