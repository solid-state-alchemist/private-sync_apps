#title = "行を下に移動"
#tooltip = "行を下に移動 (複数行可)"
#icon = "arrows_swap_down.ico"
// #icon = "Mery用 マテリアルデザインっぽいアイコン.icl",222

/**
 * 最終更新: 2019/05/07
 * Mery ver 2.7.4 以上ならブックマーク設定を維持する
 * ※ Mery 2.7.3 以前では、行を移動するとブックマーク情報が壊れる
 * 
 * 選択範囲を拡張してカーソル行(論理行)を下の行と入れ替える (複数行可)
 * 
 * 選択範囲の末尾の改行 \n は無視するので、行のトリプルクリックや、
 * 行番号のクリックやドラッグでの論理行選択をした状態から移動可能。
 * 
 * ※ 選択範囲の末尾に空改行の空行 ( ^\n ) をふくめて移動させるばあい、
 *   文書末尾の空改行の空行 ( ^[EOF] ) にむかって移動させると、
 *   選択範囲末尾の空改行の空行をつぶしてしまう。
 *   あらかじめ文書終端の空行に空白文字などを入れておけばつぶさない。
 * 
 */

var d = editor.ActiveDocument;
var s = editor.ActiveDocument.selection;
// 移動元の選択範囲
var ty = s.GetTopPointY( mePosLogical );
var by = s.GetBottomPointY( mePosLogical );
var bx = s.GetBottomPointX( mePosLogical );
// 選択範囲の末尾が終端の空行 ( ^[EOF] ) にあるときの調整
// カーソル位置に文字がないばあいを [EOF] と判定する
var eof = ( bx == 1 && ! d.Text.charAt( s.GetActivePos() ) )
        ? true : false;
// 選択範囲の末尾が行頭にあるときの調整
if ( ty != by && bx == 1 && ! eof ) {
  by --;
}

// 「行を下に移動」の中断処理
if ( d.ReadOnly ) {
  Status = "　ドキュメントは書き換え禁止です。";
}
else if ( by == d.GetLines( 0 ) ) {	// 下にいけない
  Status = "　ファイルの末尾です";
}

else {
  Redraw = false;

  /* 移動先のブックマーク設定を維持する（Mery 2.7.4） */
  if ( VersionCheck( "2.7.4" ) ) {
    BeginUndoGroup();
    var sy = ScrollY;
    // 選択範囲を確定する
    s.SetAnchorPoint( mePosLogical, 1, ty );
    s.SetActivePoint( mePosLogical, 1, by, true );
    s.EndOfLine( true, mePosLogical );
    var len = s.Text.length;
    var tp = s.GetAnchorPos();
    var bp = s.GetActivePos();
    // 「移動先の行」
    var nLine = d.GetLine( by + 1, 0 );
    // 移動元の先頭行と「移動先の行」のブックマークを確認
    var nBookmark, pBookmark;
    s.SetActivePoint( mePosLogical, 1, ty + 1 );
    if ( s.PreviousBookmark()
         && s.GetActivePointY( mePosLogical ) == ty ) {
      pBookmark = true;
    }
    s.SetActivePos( bp );
    if ( s.NextBookmark()
         && s.GetActivePointY( mePosLogical ) == by + 1 ) {
      nBookmark = true;
    }
    // 「移動先の行」（下）を削除
    s.SetAnchorPos( bp );
    s.SetActivePos( bp + 1, true );
    s.EndOfLine( true, mePosLogical );
    s.Delete();
    // 選択範囲の先頭に「移動先の行」の文字列を追加
    s.SetActivePos( tp );
    // ブックマークを復旧
    if ( nBookmark != pBookmark ) {
      editor.ExecuteCommandByID( MEID_EDIT_TOGGLE_BOOKMARK = 2126 );
    }
    s.Text = nLine + "\n";
    if ( pBookmark ) {
      editor.ExecuteCommandByID( MEID_EDIT_TOGGLE_BOOKMARK = 2126 );
    }
    // 範囲選択（カーソルは移動後の先頭）
    s.SetAnchorPos( s.GetActivePos() + len + 1 );
    ScrollY = sy;
  }

  /* 移動範囲のブックマーク設定を維持しない */
  else {
    // 選択範囲を拡張する
    s.SetAnchorPoint( mePosLogical, 1, ty );
    s.SetActivePoint( mePosLogical, 1, by + 1, true );
    s.EndOfLine( true, mePosLogical );
    // 選択行を下へ移動
    var a = s.Text.split( "\n" );
    a.unshift( a.pop() );
    s.Text = a.join( "\n" );
    // 移動元のテキストを範囲選択（末尾改行 \n を含める）
    // カーソルは移動後の先頭
    s.SetAnchorPos( s.GetActivePos() + 1 );
    s.SetActivePoint( mePosLogical, 1, ty + 1, true );
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