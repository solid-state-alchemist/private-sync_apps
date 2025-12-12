// -----------------------------------------------------------------------------
// このファイルから検索(マッチしない行)
//
// Copyright (c) Kuro. All Rights Reserved.
// www: https://www.haijin-boys.com/
// -----------------------------------------------------------------------------

var s = prompt("検索", "");
if (s !== "") {
	var r = new RegExp(s, "i");
	var s1 = document.Text.split("\n");
	var s2	= new Array();
	for (var i = 0; i < s1.length; i++) {
		if (!r.exec(s1[i]))
			s2.push(s1[i]);
	}
	document.Text = s2.join("\n");
	document.selection.StartOfDocument();
}
