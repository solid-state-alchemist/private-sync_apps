#title = "重複行の削除"
#tooltip = "選択範囲または文書全体から重複行を削除します。"
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
var map = {};
var obj = {};
doMultiEdit(function() {
	var lines = sel.Text.replace(/\n?$/, '').split('\n');
	var result = [];
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		if (map[line] !== obj) {
			result.push(line);
			map[line] = obj;
		}
	}
	sel.Text = result.join('\n') + RegExp.lastMatch;
}, !isEmpty);
