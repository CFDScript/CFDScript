//    ____   _____   ____      _____                 __                    //
//   / ___) |  ___) |  _ \    / ____)               (__)             _     //
//  | |     | |___  | | \ \  | (___     ____   ___   __    ____    _| |_   //
//  | |     |  ___) | |  ) )  \___ \   / ___) |  _) |  |  |  _ \  |_   _)  //
//  | |___  | |     | |_/ /   ____) ) | |___  | /   |  |  | |_) )   | |    //
//   \____) |_|     |____/   |_____/   \____) |/    |__|  |  __/    | |    //
//                                                        | |       | |    //
//                                                        |_|       | |_   //
//   Website:  www.cfdscript.com                                    \ __\  //

// Gauss elimination
export function gauss(A, x) {

  var i;
  var k;
  var j;

  // Make a single matrix by appending x to A
  for (i = 0; i < A.length; i++) {
    A[i].push(x[i]);
  }
  var n = A.length;

  // Search for the maximum element in each column
  for (i = 0; i < n; i++) {
    var maxEl = Math.abs(A[i][i]);
    var maxRow = i;
    for (k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    // Swap the maximum row with the current row (column by column)
    for (k = i; k < n + 1; k++) {
      var tmp = A[maxRow][k];
      A[maxRow][k] = A[i][k];
      A[i][k] = tmp;
    }

    // Make all elements below the current row zero
    for (k = i + 1; k < n; k++) {
      var c = -A[k][i] / A[i][i];
      for (j = i; j < n + 1; j++) {
        if (i === j) {
          A[k][j] = 0;
        } else {
          A[k][j] += c * A[i][j];
        }
      }
    }
  }

  // Solve the equations using back substitution
  var x = array_fill(0, n, 0);
  for (i = n - 1; i >= 0; i--) {
    x[i] = A[i][n] / A[i][i];
    for (k = i - 1; k >= 0; k--) {
      A[k][n] -= A[k][i] * x[i];
    }
  }

  return x;
}

function array_fill(i, n, v) {
  var a = [];
  for (; i < n; i++) {
    a.push(v);
  }
  return a;
}
