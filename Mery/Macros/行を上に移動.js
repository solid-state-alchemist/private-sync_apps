#title = "行を上に移動"
#tooltip = "行を上に移動 (複数行可)"
#icon = "arrows_swap_up.ico"
// #icon = "Mery用 マテリアルデザインっぽいアイコン.icl",223

/**
 * 最終更新: 2019/05/07
 * Mery ver 2.7.4 以上ならブックマーク設定を維持する
 * ※ Mery 2.7.3 以前では、行を移動するとブックマーク情報が壊れる
 * 
 * 選択範囲を拡張してカーソル行(論理行)を上の行と入れ替える (複数行可)
 * 
 * ※ 文書末の空改行の空行 ( ^[EOF] ) を選択範囲にふくめて移動させるときは、
 *   行番号を上から下にドラッグして末行にキャレットがくるように範囲選択すれば
 *   文書終端の空行を入れればぶら下げて移動できる。
 * 
 */

var d = editor.ActiveDocument;
var s = editor.ActiveDocument.selection;
// 移動元の選択範囲
var ty = s.GetTopPointY( mePosLogical );
var by = s.GetBottomPointY( mePosLogical );
var bx = s.GetBottomPointX( mePosLogical );

// 「行を上に移動」の中断処理
if ( d.ReadOnly ) {
  Status = "　ドキュメントは書き換え禁止です。";
}
else if ( ty == 1 ) { 	// 上にいけない 
  Status = "　ファイルの先頭です";
}

else {
  Redraw = false;
  // 選択範囲の末尾が終端の空行 ( ^[EOF] ) にあるときの調整
  // カーソル位置に文字がないばあいを [EOF] と判定する
  var eof = ( bx == 1 && ! d.Text.charAt( s.GetActivePos() ) )
          ? "\n" : "";
  // 選択範囲の末尾が行頭にあるときの調整
  if ( ty != by && bx == 1 ) {
    by --;
  }

  /* 移動範囲のブックマーク設定を維持する（Mery 2.7.4 以上） */
  if ( VersionCheck( "2.7.4" ) ) {
    BeginUndoGroup();
    var sy = ScrollY;
    // 選択範囲を確定する
    s.SetAnchorPoint( mePosLogical, 1, ty );
    s.SetActivePoint( mePosLogical, 1, by, true );
    s.EndOfLine( true, mePosLogical );
    if ( eof ) {
      s.SetActivePos( s.GetActivePos() + 1, true );
    }
    var tp = s.GetAnchorPos();
    var bp = s.GetActivePos();
    // 「移動先の行」
    var pLine = d.GetLine( ty - 1, 0 );
    // 移動元の先頭行と「移動先の行」のブックマークを確認
    var nBookmark, pBookmark;
    s.SetActivePos( tp - 1 );
    if ( s.NextBookmark()
         && s.GetActivePointY( mePosLogical ) == ty ) {
      nBookmark = true;
    }
    s.SetActivePos( tp );
    if ( s.PreviousBookmark()
         && s.GetActivePointY( mePosLogical ) == ty - 1 ) {
      pBookmark = true;
    }
    // 選択範囲の末尾に「移動先の行」の文字列を追加
    s.SetActivePos( bp );
    s.Text = "\n" + pLine;
    if ( pBookmark ) {
      editor.ExecuteCommandByID( MEID_EDIT_TOGGLE_BOOKMARK = 2126 );
    }
    // 「移動先の行」（上）を削除
    s.SetActivePos( tp - 1 );
    s.SelectLine();
    s.Delete();
    // ブックマークを復旧
    if ( nBookmark != pBookmark ) {
      editor.ExecuteCommandByID( MEID_EDIT_TOGGLE_BOOKMARK = 2126 );
    }
    // 範囲選択（カーソルは移動後の先頭）
    s.SetAnchorPoint( mePosLogical, 1, by + eof.length );
    ScrollY = sy;
  }

  /* 移動範囲のブックマーク設定を維持しない */
  else {
    // 選択範囲を拡張する
    s.SetAnchorPoint( mePosLogical, 1, ty - 1 );
    s.SetActivePoint( mePosLogical, 1, by, true );
    s.EndOfLine( true, mePosLogical );
    if ( eof ) {
      s.SetActivePos( s.GetActivePos() + 1, true );
    }
    // 選択行を上へ移動
    var a = s.Text.split( "\n" );
    a.push( a.shift() );
    s.Text = a.join( "\n" );
    // 移動元のテキストを範囲選択（末尾改行 \n を含める）
    // カーソルは移動後の先頭
    s.StartOfLine( false, mePosLogical );
    s.SetAnchorPos( s.GetActivePos() );
    s.SetActivePoint( mePosLogical, 1, ty - 1, true );
  }
  Redraw = true;
}

/**
 * 組み込み関数 VersionCheck( versionStr )
 * Mery 本体が引数で指定したバージョン以上かチェックする（ e.g. "2.7.0" ）
 * 戻り値は、真偽値 true/false
 */
function VersionCheck( versionStr ) {
  var Pad2 = function ( str ) {
    return str.toString().replace( /[0-9]+/g , function( tmp ) {
      return tmp.length < 2 ? "0" + tmp : tmp; } );
  };
  var editorVer = Number( Pad2( editor.Version ).replace( /\./g, "" ).slice( 0, 6 ) );
  var requirement = Number( Pad2( versionStr ).replace( /\./g, "" ).slice( 0, 6 ) );
  return ( editorVer >= requirement );
}