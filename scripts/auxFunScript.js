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
export function gaussElim(A, x) {

  let i;
  let k;
  let j;

  // Make a single matrix by appending x to A
  for (i = 0; i < A.length; i++) {
    A[i].push(x[i]);
  }
  let n = A.length;

  // Search for the maximum element in each column
  for (i = 0; i < n; i++) {
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;
    for (k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    // Swap the maximum row with the current row (column by column)
    for (k = i; k < n + 1; k++) {
      let tmp = A[maxRow][k];
      A[maxRow][k] = A[i][k];
      A[i][k] = tmp;
    }

    // Make all elements below the current row zero
    for (k = i + 1; k < n; k++) {
      let c = -A[k][i] / A[i][i];
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
  x = array_fill(0, n, 0);
  for (i = n - 1; i >= 0; i--) {
    x[i] = A[i][n] / A[i][i];
    for (k = i - 1; k >= 0; k--) {
      A[k][n] -= A[k][i] * x[i];
    }
  }

  return x;
}

function array_fill(i, n, v) {
  let a = [];
  for (; i < n; i++) {
    a.push(v);
  }
  return a;
}

// Check the solid heat boundary conditions
export function checkSolidHeatBoundaryConditions(boundaryConditions) {
  const boundaryConditionCounts = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  };

  if (boundaryConditions.neumannTop) boundaryConditionCounts.top++;
  if (boundaryConditions.neumannBottom) boundaryConditionCounts.bottom++;
  if (boundaryConditions.neumannLeft) boundaryConditionCounts.left++;
  if (boundaryConditions.neumannRight) boundaryConditionCounts.right++;
  if (boundaryConditions.robinTop) boundaryConditionCounts.top++;
  if (boundaryConditions.robinBottom) boundaryConditionCounts.bottom++;
  if (boundaryConditions.robinLeft) boundaryConditionCounts.left++;
  if (boundaryConditions.robinRight) boundaryConditionCounts.right++;
  if (boundaryConditions.dirichletTop) boundaryConditionCounts.top++;
  if (boundaryConditions.dirichletBottom) boundaryConditionCounts.bottom++;
  if (boundaryConditions.dirichletLeft) boundaryConditionCounts.left++;
  if (boundaryConditions.dirichletRight) boundaryConditionCounts.right++;

  let moreThanOneBoundaryCondition = '';
  let multipleCount = 0;
  
  for (const side in boundaryConditionCounts) {
    if (boundaryConditionCounts[side] > 1) {
      moreThanOneBoundaryCondition += `${side} `;
      multipleCount++;
    }
  }

  if (multipleCount > 0) {
    console.log(`checkSolidHeatBoundaryConditions: More than one boundary condition is applied on the following side(s): ${moreThanOneBoundaryCondition}`);
  } else {
    console.log('checkSolidHeatBoundaryConditions: Only one boundary condition is applied on each side');
  }
}

// Print CFDScript version
export function CFDScriptVersion() {
  console.log("CFDscript v0.1");
}