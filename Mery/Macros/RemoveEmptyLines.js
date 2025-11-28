#title = "空行の削除"
#tooltip = "選択範囲または文書全体から空行を削除します。"
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
	var lines = sel.Text.replace(/\n?$/, '').split('\n');
	var result = [];
	for (var i = 0; i < lines.length; i++) {
		if (lines[i] !== '') {
			result.push(lines[i]);
		}
	}
	sel.Text = result.join('\n') + RegExp.lastMatch;
}, !isEmpty);
