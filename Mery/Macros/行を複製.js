#title = "複製"
#tooltip = "選択範囲(複数行可)の論理行を複製する"
#icon = "arrow_duplicate_down.ico"

// 上向きの矢印
// #icon = "arrow_duplicate_up.ico"

// #icon = "Mery用 マテリアルデザインっぽいアイコン.icl",222
// 上向きの矢印のアイコンのインデックスは 223

/**
 * ---------------------------------------------------------
 * 行を複製 (複数行可)
 * sukemaru, 2018/08/12 - 2020/06/26
 * ---------------------------------------------------------
 * 2020/06/26: マルチカーソル／複数選択に対応
 * 
 * カーソル行、または選択範囲を含む行全体を "複製" する (論理行単位、複数行可)
 * Mery ver 3.0.1 以上なら Undo したときに選択範囲を復帰できる
 *
 * 文書終端の空行 [EOF] を選択範囲の末尾にぶら下げての "複製" はできるが、
 * 可否について条件あり。
 *
 *   選択範囲の確定時点でのキャレットの位置が "選択範囲の先頭にあるか"
 *   または "末尾 ( [EOF] マークの直前) にあるか" で判別する。
 *
 *   文字列または行番号をドラッグ（または"クリック ＆ Shift＋クリック"）して
 *   選択範囲を確定するさいに
 *   ・上から下にむけて選択範囲をつくった場合 → 終端の空行を含める
 *   ・下から上にむけて選択範囲をつくった場合 → 終端の空行を含めない
 *
 * 1行だけの複製なら
 * document.selection.DuplicateLine();
 */

// ---------- ▼ 設定項目 ▼ ----------

// ■ 複製後の選択範囲
var duplicateDown = true;	// （下の行：true ／ 上の行：false）


// ■ 複数行選択のとき、ブックマークを維持するか？
var preferBookmark = true;

  // false ならブックマークは解除されるが、アンドゥしても選択範囲（行単位）を維持する
  // true  ならアンドゥすると選択範囲が解除されるが、ブックマークを維持する
  // ※ブックマークは上の行に残す

// ---------- ▲ 設定項目 ▲ ----------

var d = editor.ActiveDocument;
var s = d.selection;

if ( d.ReadOnly ) {
  Status = "　ドキュメントは書き換え禁止です。";
}
else {
  var sx = ScrollX,  sy = ScrollY;
  var sMode = s.Mode;
  if ( sMode ) {
    BeginUndoGroup();  AddUndo();
  }

  // マルチカーソル／複数選択に対応
  var arg = [ duplicateDown, preferBookmark ];
  // 選択範囲が１つで矩形選択ではないとき
  if ( ! sMode || sMode === 1 ) {
    DuplicateLines( arg );
  }
  // 矩形選択または複数選択のとき
  else {
    MultiFunction( DuplicateLines, arg );
  }

  if ( sMode ) {
    EndUndoGroup();
  }
  ScrollX = sx;  ScrollY = sy;
}

/**
 * 関数 DuplicateLines( [ duplicateDown, preferBookmark ] )
 * 行を複製 (複数行可)
 */
function DuplicateLines( arg ) {
  var duplicateDown  = arg[0];
  var preferBookmark = arg[1];

  var d = editor.ActiveDocument;
  var s = d.selection;

  // 選択範囲の各座標を取得
  var ty = s.GetTopPointY( mePosLogical );
  var bx = s.GetBottomPointX( mePosLogical );
  var by = s.GetBottomPointY( mePosLogical );
  var ey = d.GetLines( 0 );		// 文書終端行のY

  // 選択範囲の末尾が終端の空行 ( ^[EOF] ) にあるときの調整用
  var eof = ( ty < by && bx == 1 && ! d.Text.charAt( s.GetActivePos() ) )
          ? "\n" : "";	// カーソル位置に文字がないばあいを [EOF] と判定する

  // 選択範囲の末尾が行頭にあるときの調整
  if ( ty < by && bx == 1 ) { by --; }
  // 選択範囲の拡張
  s.SetActivePoint( mePosLogical, 1, by )
  s.EndOfLine( false, mePosLogical );
  s.SetAnchorPoint( mePosLogical, 1, ty );

  // 選択範囲に改行を追加して複製
  var st = s.Text;

  if ( preferBookmark ) {
    s.Collapse( meCollapseEnd );
    s.Text = eof + "\n" + st;
  }
  else {
    s.Text = st + eof + "\n" + st;
  }

  // ■下に複製した行全体を範囲選択する
  //   ※文書終端の空行を含めているか否かで実行後のキャレットの位置をかえているのは
  //     連続で実行するさいに同じ範囲を選択状態にして複製させるための仕様
  if ( duplicateDown ) {
    // 終端の空行をふくめて複製した場合 → キャレット位置は選択範囲の末尾
    if ( eof ) {
      s.SetActivePoint( mePosLogical, 1, by + ( eof + "\n" ).length );
      s.EndOfDocument( true );
    }
    // 通常の行の複製の場合 → キャレット位置は選択範囲の先頭
    else {
      s.SetAnchorPos( s.GetActivePos() + 1 );
      s.SetActivePoint( mePosLogical, 1, by + 1, true );
    }
  }

  // ■上に複製した行全体を範囲選択
  else {
    // 終端の空行だけを複製した場合 → 範囲選択なし
    if ( ty == ey && ! st ) {
      s.SetActivePos( s.GetActivePos() - 1 );
    }
    // 通常の行の複製の場合 → カーソル位置は選択範囲の末尾
    else {
      s.SetAnchorPoint( mePosLogical, 1, ty );
      s.SetActivePoint( mePosLogical, 1, by + 1, true );
      // 終端の空行をふくめて複製した場合
      if ( eof ) {
        s.SetActivePos( s.GetActivePos() + eof.length, true );
      }
    }
  }
}

/**
 * 関数 MultiFunction( Fn, arg1 )
 * マルチカーソル（複数選択範囲）に対応させる
 * 第１引数: Function; 選択範囲ごとに適用する処理の関数
 * 第２引数: Function に渡す引数をまとめた配列
 */
function MultiFunction( Fn, arg ) {
  var d = editor.ActiveDocument;
  var s = d.selection;

  // 矩形選択範囲は行に分ける
  s.Mode = meModeMulti;

  // 選択範囲の座標を取得
  var sCount = s.Count;
  var Sel = [];
  for ( var i = 0; i < sCount; i ++ ) {
    Sel[i] = {
      act: s.GetActivePos( i ),
      anc: s.GetAnchorPos( i )
    };
  }

  // 各選択範囲を処理;
  for ( var i = 0, diff = 0, dl; i < sCount; i ++ ) {
    dl = d.TextLength;
    s.SetActivePos( Sel[i].act + diff );
    s.SetAnchorPos( Sel[i].anc + diff );

    Fn( arg );	// DuplicateLines() 関数で行を複製

    // Fn() の残した選択範囲（またはキャレット位置）を回収
    Sel[i].act = s.GetActivePos();
    Sel[i].anc = s.GetAnchorPos();
    diff += d.TextLength - dl;	// 文字数の増減量（累積）
  }

  // マルチカーソル（複数選択範囲）を復帰
  for ( var i = 0; i < sCount; i ++ ) {
    s.AddPos( Sel[i].anc, Sel[i].act );
  }
}
