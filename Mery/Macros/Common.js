/*
Copyright (c) Kuro. All rights reserved.
Licensed under the MIT License.
*/
function doMultiEdit(func, keepSel) {
	var doc = document, sel = doc.selection;
	Redraw = false;
	sel.Mode = meModeMulti;
	var pos = [{ anchor: sel.GetAnchorPos(), active: sel.GetActivePos() }];
	if (sel.Count > 0) {
		BeginUndoGroup();
		AddUndo();
		pos = [];
		for (var i = 0; i < sel.Count; i++) {
			pos.push({ anchor: sel.GetAnchorPos(i), active: sel.GetActivePos(i) });
		}
	}
	var offset = 0, length = 0;
	for (var i = 0; i < pos.length; i++) {
		sel.SetActivePos(pos[i].anchor + offset);
		sel.SetActivePos(pos[i].active + offset, true);
		length = doc.Text.length;
		func();
		if (keepSel && sel.isEmpty) {
			sel.SetAnchorPos(Math.min(pos[i].anchor, pos[i].active) + offset);
		}
		offset += doc.Text.length - length;
		pos[i] = { anchor: sel.GetAnchorPos(), active: sel.GetActivePos() };
	}
	for (var i = 0; i < pos.length; i++) {
		sel.AddPos(pos[i].anchor, pos[i].active);
	}
	EndUndoGroup();
	Redraw = true;
}
