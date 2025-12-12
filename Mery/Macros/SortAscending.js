#language = "quickjs"
#title = "昇順に並べ替え (A から Z)"
#tooltip = "選択範囲または文書全体を昇順に並べ替えます。"
#include "Common.js"
#begingroup = true
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
	sel.Text = sel.Text.replace(/\n?$/, '').split('\n').sort().join('\n') + (sel.Text.endsWith('\n') ? '\n' : '');
}, !isEmpty);
