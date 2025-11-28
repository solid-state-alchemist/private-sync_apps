#title = "番号の挿入"
#tooltip = "カーソル位置に番号を挿入します。"
#include "Common.js"
/*
Copyright (c) Kuro. All rights reserved.
Licensed under the MIT License.
*/
var sel = document.selection;
var multi = sel.Mode === meModeMulti || !sel.IsEmpty;
var str = prompt(multi ? '最初の番号(&N):' : '番号の範囲(&N):', multi ? '1' : '1-10');
if (str) {
	var range = str.match(/([+-]?\d+)(?:.+?([+-]?\d+))?/) || [];
	var start = Number(range[1]);
	var end = Number(range[2] || range[1]);
	if (!isNaN(start) && !isNaN(end) && (start >= -9999999) && (start <= 9999999) && (end >= -9999999) && (end <= 9999999)) {
		if (sel.Mode === meModeStream) {
			if (multi) {
				end = start + sel.GetBottomPointY(mePosView) - sel.GetTopPointY(mePosView);
			}
			var num = [];
			var step = start <= end ? 1 : -1;
			for (var i = start; i !== end + step; i += step) {
				num.push(i);
			}
			if (num.length > 0) {
				sel.Text = num.join('\n') + '\n';
			}
		} else {
			doMultiEdit(function() {
				sel.Text = start;
				start++;
			});
		}
	} else {
		alert('-9999999 から 9999999 までの整数を指定してください。');
	}
}
