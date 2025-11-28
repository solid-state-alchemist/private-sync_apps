#title = "一致する行を抽出"
#tooltip = "文書全体から一致する行を抽出します。"
#begingroup = true
/*
Copyright (c) Kuro. All rights reserved.
Licensed under the MIT License.
*/
var str = prompt('検索する文字列(&F):', '');
if (str) {
	var doc = document, sel = doc.selection;
	var regex = new RegExp(str, 'i');
	var lines = doc.Text.split('\n');
	var result = [];
	for (var i = 0; i < lines.length; i++) {
		if (regex.test(lines[i])) {
			result.push(lines[i]);
		}
	}
	doc.Text = result.join('\n');
	sel.StartOfDocument();
}
